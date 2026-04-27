import "server-only";

import { sendReportLink } from "@/lib/email/sendReportLink";
import { resolveLandValue } from "@/lib/land/resolveLandValue";
import {
  createLeadReport,
  getLeadRequestById,
  insertLeadEvent,
  updateLeadStatus,
} from "@/lib/leadgen/repository";
import { resolveMarketData } from "@/lib/market/resolveMarketData";
import { createNote, createTask, updatePropertyRemark } from "@/lib/propstack/client";
import { createRandomToken, getReportExpiryDate } from "@/lib/security/hashToken";
import { calculateValuation } from "@/lib/valuation/calculateValuation";

function getBaseUrl(request: Request) {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  const proto = request.headers.get("x-forwarded-proto") || "http";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

function hasResidentialRequirements(lead: { living_area: number | null; construction_year: number | null }) {
  return Boolean(lead.living_area && lead.living_area > 0 && lead.construction_year);
}

function buildRemark(input: {
  reportUrl: string;
  expiresAt: Date;
  lead: NonNullable<Awaited<ReturnType<typeof getLeadRequestById>>>;
  rangeMin: number;
  rangeMax: number;
  adjustedValue: number;
  dataBasis: string;
  marketLevel: string;
}) {
  const lead = input.lead;
  return [
    "Automatische Marktpreiseinschätzung über Frisia Immobilien Leadgenerator",
    "",
    `Objektart: ${lead.object_type ?? "k. A."}`,
    `Adresse: ${[lead.street, lead.house_number, lead.postal_code, lead.city].filter(Boolean).join(" ") || "k. A."}`,
    `Baujahr: ${lead.construction_year ?? "k. A."}`,
    `Wohnfläche: ${lead.living_area ? `${lead.living_area} m²` : "k. A."}`,
    `Grundstück: ${lead.plot_area ? `${lead.plot_area} m²` : "k. A."}`,
    `Zimmer: ${lead.rooms ?? "k. A."}`,
    `Zustand: ${lead.condition ?? "k. A."}`,
    `Ausstattung: ${lead.equipment ?? "k. A."}`,
    "",
    `Berechneter Orientierungswert intern: ${input.adjustedValue.toLocaleString("de-DE")} €`,
    `Ausgegebene Wertspanne: ${input.rangeMin.toLocaleString("de-DE")} € - ${input.rangeMax.toLocaleString("de-DE")} €`,
    "",
    `Datenbasis: ${input.dataBasis}`,
    `Verwendete Datenebene: ${input.marketLevel}`,
    `Erstellt am: ${new Date().toLocaleString("de-DE")}`,
    `Ergebnislink gültig bis: ${input.expiresAt.toLocaleDateString("de-DE")}`,
    `Ergebnislink: ${input.reportUrl}`,
    "",
    "Hinweis:",
    "Automatisierte Ersteinschätzung auf Grundlage der Nutzereingaben. Keine Vor-Ort-Prüfung. Keine Verkehrswertermittlung.",
  ].join("\n");
}

async function createManualReviewTask(
  lead: NonNullable<Awaited<ReturnType<typeof getLeadRequestById>>>,
  reason: string,
) {
  if (!lead.propstack_contact_id && !lead.propstack_property_id) return;

  try {
    await createTask({
      title: lead.object_type === "grundstueck" ? "Grundstück manuell anhand Bodenrichtwert prüfen" : "Marktpreis manuell prüfen",
      body: reason,
      contactId: lead.propstack_contact_id,
      propertyId: lead.propstack_property_id,
    });
  } catch (error) {
    await insertLeadEvent({
      leadRequestId: lead.id,
      eventName: "valuation_failed",
      payload: { stage: "manual_review_task", message: error instanceof Error ? error.message : String(error) },
    });
  }
}

async function syncValuationToPropstack(input: {
  lead: NonNullable<Awaited<ReturnType<typeof getLeadRequestById>>>;
  reportUrl: string;
  expiresAt: Date;
  rangeMin: number;
  rangeMax: number;
  adjustedValue: number;
  dataBasis: string;
  marketLevel: string;
}) {
  if (!input.lead.propstack_property_id) return;

  const remark = buildRemark(input);

  try {
    await updatePropertyRemark(input.lead.propstack_property_id, remark);
    await createNote({
      title: "Automatische Marktpreiseinschätzung",
      body: remark,
      contactId: input.lead.propstack_contact_id,
      propertyId: input.lead.propstack_property_id,
    });
    await createTask({
      title: "Bewertung besprechen und Eigentümer qualifizieren",
      body: "Die automatische Marktpreiseinschätzung wurde erstellt. Bitte Ergebnis persönlich einordnen und Eigentümer qualifizieren.",
      contactId: input.lead.propstack_contact_id,
      propertyId: input.lead.propstack_property_id,
    });
  } catch (error) {
    await insertLeadEvent({
      leadRequestId: input.lead.id,
      eventName: "valuation_failed",
      payload: { stage: "propstack_after_valuation", message: error instanceof Error ? error.message : String(error) },
    });
  }
}

export async function calculateLeadReportForLead(input: { leadRequestId: string; request: Request }) {
  const lead = await getLeadRequestById(input.leadRequestId);
  if (!lead) {
    return { success: false as const, status: 404, error: "Lead nicht gefunden." };
  }

  await insertLeadEvent({ leadRequestId: lead.id, eventName: "valuation_started" });

  if (lead.object_type === "gewerbe") {
    await createManualReviewTask(lead, "Gewerbe-Lead ohne automatische Bewertung qualifizieren.");
    await updateLeadStatus(lead.id, "failed");
    await insertLeadEvent({ leadRequestId: lead.id, eventName: "valuation_failed", payload: { reason: "commercial_manual" } });
    return { success: true as const, manualReview: true, reason: "Gewerbe wird manuell qualifiziert." };
  }

  let valuation;
  let marketDataId: string | null = null;

  if (lead.object_type === "haus" || lead.object_type === "wohnung") {
    if (!hasResidentialRequirements(lead)) {
      return { success: false as const, status: 400, error: "Für die Bewertung fehlen Wohnfläche oder Baujahr." };
    }

    const market = await resolveMarketData({
      object_type: lead.object_type,
      city: lead.city,
      district: lead.district,
      landkreis: lead.landkreis,
      postal_code: lead.postal_code,
      lat: lead.lat,
      lng: lead.lng,
    });

    if (!market) {
      await createManualReviewTask(lead, "Keine geeigneten Marktdaten für die automatische Bewertung gefunden.");
      await updateLeadStatus(lead.id, "failed");
      await insertLeadEvent({ leadRequestId: lead.id, eventName: "valuation_failed", payload: { reason: "no_market_data" } });
      return { success: true as const, manualReview: true, reason: "Keine ausreichend belastbaren Marktdaten vorhanden." };
    }

    marketDataId = market.market_data_id;
    valuation = calculateValuation({
      object_type: lead.object_type,
      living_area: Number(lead.living_area),
      plot_area: lead.plot_area,
      rooms: lead.rooms,
      construction_year: lead.construction_year,
      condition: lead.condition,
      equipment: lead.equipment,
      energy_class: lead.energy_class,
      elevator: lead.elevator,
      balcony: lead.balcony,
      garden: lead.garden,
      garage: lead.garage,
      basement: lead.basement,
      market,
    });
  } else if (lead.object_type === "grundstueck") {
    if (!lead.plot_area || lead.plot_area <= 0) {
      return { success: false as const, status: 400, error: "Für Grundstücke fehlt die Grundstücksfläche." };
    }

    const land = await resolveLandValue({
      street: lead.street,
      house_number: lead.house_number,
      postal_code: lead.postal_code,
      city: lead.city,
      district: lead.district,
      landkreis: lead.landkreis,
      lat: lead.lat,
      lng: lead.lng,
      plot_area: Number(lead.plot_area),
      nutzungsart: lead.sub_type,
      erschliessung: lead.condition,
    });

    if (!land) {
      await createManualReviewTask(lead, "BORIS/Bodenrichtwert konnte nicht automatisch ermittelt werden.");
      await updateLeadStatus(lead.id, "failed");
      await insertLeadEvent({ leadRequestId: lead.id, eventName: "valuation_failed", payload: { reason: "no_boris_data" } });
      return { success: true as const, manualReview: true, reason: "Bodenrichtwert nicht automatisch verfügbar." };
    }

    valuation = calculateValuation({
      object_type: "grundstueck",
      plot_area: Number(lead.plot_area),
      bodenrichtwert_eur_m2: land.bodenrichtwert_eur_m2,
    });
  } else {
    return { success: false as const, status: 400, error: "Objektart fehlt." };
  }

  const token = createRandomToken();
  const expiresAt = getReportExpiryDate();
  const report = await createLeadReport({ lead, token, expiresAt, valuation, marketDataId });
  if (!report) throw new Error("Report konnte nicht erstellt werden.");

  const reportUrl = `${getBaseUrl(input.request)}/bewertung/${token}`;

  await syncValuationToPropstack({
    lead,
    reportUrl,
    expiresAt,
    rangeMin: valuation.range_min,
    rangeMax: valuation.range_max,
    adjustedValue: valuation.adjusted_value,
    dataBasis: valuation.data_source,
    marketLevel: valuation.market_level_used,
  });

  const sent = await sendReportLink({ lead: report, reportUrl });
  await updateLeadStatus(lead.id, sent.provider === "failed" ? "valuation_calculated" : "report_sent");
  await insertLeadEvent({
    leadRequestId: lead.id,
    eventName: "valuation_completed",
    payload: { reportId: report.id, rangeMin: valuation.range_min, rangeMax: valuation.range_max },
  });
  if (sent.provider !== "failed") {
    await insertLeadEvent({
      leadRequestId: lead.id,
      eventName: "email_sent",
      payload: { provider: sent.provider, messageId: sent.messageId },
    });
  }

  return {
    success: true as const,
    leadRequestId: lead.id,
    reportId: report.id,
    reportUrl,
    expiresAt: expiresAt.toISOString(),
    range: { min: valuation.range_min, max: valuation.range_max },
    value: {
      min: valuation.range_min,
      mid: valuation.adjusted_value,
      max: valuation.range_max,
    },
    confidence: { score: valuation.accuracy_score, label: valuation.confidence_label },
    emailProvider: sent.provider,
    emailSentAt: sent.provider === "failed" ? null : new Date().toISOString(),
    email: lead.email,
  };
}
