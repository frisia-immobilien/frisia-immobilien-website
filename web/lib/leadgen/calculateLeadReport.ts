import "server-only";

import { sendReportLink } from "@/lib/email/sendReportLink";
import { resolveLandValue } from "@/lib/land/resolveLandValue";
import {
  createLeadReport,
  createManualLeadReport,
  getLeadRequestById,
  insertLeadEvent,
  updateLeadStatus,
} from "@/lib/leadgen/repository";
import { resolveMarketData } from "@/lib/market/resolveMarketData";
import { createNote, createTask, formatLeadOtherExtrasLines, updatePropertyRemark } from "@/lib/propstack/client";
import { createRandomToken, getReportExpiryDate } from "@/lib/security/hashToken";
import { absoluteUrl } from "@/lib/site";
import {
  calculateValuation,
  getManualReviewReasonForValuationInput,
  type ValuationInput,
} from "@/lib/valuation/calculateValuation";

function hasResidentialRequirements(lead: { living_area: number | null; construction_year: number | null }) {
  return Boolean(lead.living_area && lead.living_area > 0 && lead.construction_year);
}

function objectTypeLabel(value: string | null) {
  if (value === "haus") return "Haus";
  if (value === "wohnung") return "Wohnung";
  if (value === "grundstueck") return "Grundstück";
  if (value === "gewerbe") return "Gewerbe";
  return value || "k. A.";
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
  const otherExtrasLines = formatLeadOtherExtrasLines(lead);
  const address = [
    [lead.street, lead.house_number].filter(Boolean).join(" "),
    [lead.postal_code, lead.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  return [
    "Leadgenerator Bewertung gestartet",
    "",
    "Adresse:",
    address || "k. A.",
    "",
    "Immobilienart:",
    objectTypeLabel(lead.object_type),
    "",
    "Wohnfläche:",
    lead.living_area ? `${lead.living_area} m²` : "k. A.",
    "",
    "Grundstück:",
    lead.plot_area ? `${lead.plot_area} m²` : "k. A.",
    "",
    "Baujahr:",
    `${lead.construction_year ?? "k. A."}`,
    "",
    "Zustand:",
    lead.condition ?? "k. A.",
    ...(otherExtrasLines.length > 0 ? ["", ...otherExtrasLines] : []),
    "",
    "Berechnete Spanne:",
    `${input.rangeMin.toLocaleString("de-DE")} € - ${input.rangeMax.toLocaleString("de-DE")} €`,
    "",
    "Orientierungswert:",
    `${input.adjustedValue.toLocaleString("de-DE")} €`,
    "",
    "Status:",
    "offen",
    "",
    "Nächster Schritt:",
    "Rückruf / persönliche Prüfung",
    "",
    "Bewertungslink:",
    input.reportUrl,
    "",
    `Link gültig bis: ${input.expiresAt.toLocaleDateString("de-DE")}`,
  ].join("\n");
}

async function createManualReviewTask(
  lead: NonNullable<Awaited<ReturnType<typeof getLeadRequestById>>>,
  reason: string,
) {
  if (!lead.propstack_contact_id && !lead.propstack_property_id) return;

  const otherExtrasLines = formatLeadOtherExtrasLines(lead);

  try {
    await createTask({
      title: lead.object_type === "grundstueck" ? "Grundstück manuell anhand Bodenrichtwert prüfen" : "Marktpreis manuell prüfen",
      body: [reason, ...(otherExtrasLines.length > 0 ? ["", ...otherExtrasLines] : [])].join("\n"),
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

async function returnManualReview(
  lead: NonNullable<Awaited<ReturnType<typeof getLeadRequestById>>>,
  reason: string,
  eventReason: string,
) {
  await createManualReviewTask(lead, reason);
  const token = createRandomToken();
  const expiresAt = getReportExpiryDate();
  const report = await createManualLeadReport({ lead, token, expiresAt, reason });
  if (!report) throw new Error("Manueller Bewertungsreport konnte nicht erstellt werden.");

  const reportUrl = absoluteUrl(`/bewertung-ergebnis/${token}`);
  const sent = await sendReportLink({ lead: report, reportUrl });
  const emailWasSent = sent.provider === "resend";
  await updateLeadStatus(lead.id, emailWasSent ? "report_sent" : "valuation_calculated");
  await insertLeadEvent({
    leadRequestId: lead.id,
    eventName: "valuation_failed",
    payload: { reason: eventReason, manualReview: true, reportId: report.id },
  });
  if (emailWasSent) {
    await insertLeadEvent({
      leadRequestId: lead.id,
      eventName: "email_sent",
      payload: { provider: sent.provider, messageId: sent.messageId, manualReview: true },
    });
  }

  return {
    success: true as const,
    manualReview: true as const,
    reason,
    leadRequestId: lead.id,
    reportId: report.id,
    reportUrl,
    expiresAt: expiresAt.toISOString(),
    emailProvider: sent.provider,
    emailSentAt: emailWasSent ? new Date().toISOString() : null,
    email: lead.email,
  };
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
  const otherExtrasLines = formatLeadOtherExtrasLines(input.lead);

  try {
    await updatePropertyRemark(input.lead.propstack_property_id, remark);
    await createNote({
      title: "Leadgenerator Bewertung gestartet",
      body: remark,
      contactId: input.lead.propstack_contact_id,
      propertyId: input.lead.propstack_property_id,
    });
    await createTask({
      title: "Rückruf / Bewertung prüfen",
      body: [
        "Lead aus dem Leadgenerator prüfen.",
        "Marktwerteinschätzung besprechen, offene Angaben klären und nächsten Schritt anbieten.",
        ...(otherExtrasLines.length > 0 ? ["", ...otherExtrasLines] : []),
        "",
        "Priorität: hoch",
      ].join("\n"),
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
    return returnManualReview(
      lead,
      "Gewerbeimmobilien prüfen wir persönlich, weil Lage, Nutzung und Ertragsdaten stark einzelfallabhängig sind.",
      "commercial_manual",
    );
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
      return returnManualReview(
        lead,
        "Für diese Lage liegen keine ausreichend belastbaren Marktdaten vor. Wir prüfen die Einordnung deshalb persönlich.",
        "no_market_data",
      );
    }

    marketDataId = market.market_data_id;
    const valuationInput: ValuationInput = {
      object_type: lead.object_type,
      sub_type: lead.sub_type,
      living_area: Number(lead.living_area),
      plot_area: lead.plot_area,
      rooms: lead.rooms,
      construction_year: lead.construction_year,
      condition: lead.condition,
      equipment: lead.equipment,
      energy_class: lead.energy_class,
      reason: lead.reason,
      selling_intent: lead.selling_intent,
      elevator: lead.elevator,
      balcony: lead.balcony,
      garden: lead.garden,
      garage: lead.garage,
      basement: lead.basement,
      market,
    };
    const manualReviewReason = getManualReviewReasonForValuationInput(valuationInput);
    if (manualReviewReason) {
      return returnManualReview(lead, manualReviewReason, "valuation_discount_limit");
    }

    valuation = calculateValuation(valuationInput);
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
      return returnManualReview(
        lead,
        "Für dieses Grundstück konnte kein belastbarer Bodenrichtwert automatisch ermittelt werden. Wir prüfen die Bewertung persönlich.",
        "no_boris_data",
      );
    }

    valuation = calculateValuation({
      object_type: "grundstueck",
      plot_area: Number(lead.plot_area),
      bodenrichtwert_eur_m2: land.bodenrichtwert_eur_m2,
      erschliessung: lead.condition,
      bebaubarkeit: lead.sub_type,
      bebauungsgebiet: lead.sub_type,
    });
  } else {
    return { success: false as const, status: 400, error: "Objektart fehlt." };
  }

  const token = createRandomToken();
  const expiresAt = getReportExpiryDate();
  const report = await createLeadReport({ lead, token, expiresAt, valuation, marketDataId });
  if (!report) throw new Error("Report konnte nicht erstellt werden.");

  const reportUrl = absoluteUrl(`/bewertung-ergebnis/${token}`);

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
  const emailWasSent = sent.provider === "resend";
  await updateLeadStatus(lead.id, emailWasSent ? "report_sent" : "valuation_calculated");
  await insertLeadEvent({
    leadRequestId: lead.id,
    eventName: "valuation_completed",
    payload: { reportId: report.id, rangeMin: valuation.range_min, rangeMax: valuation.range_max },
  });
  if (emailWasSent) {
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
    emailSentAt: emailWasSent ? new Date().toISOString() : null,
    email: lead.email,
  };
}
