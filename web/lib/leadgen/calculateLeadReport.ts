import "server-only";

import { sendReportLink } from "@/lib/email/sendReportLink";
import { resolveLandValue } from "@/lib/land/resolveLandValue";
import {
  createLeadReport,
  createManualLeadReport,
  getLatestLeadReportByLeadId,
  getLeadRequestById,
  insertLeadEvent,
  updateLeadStatus,
} from "@/lib/leadgen/repository";
import { resolveMarketData } from "@/lib/market/resolveMarketData";
import { createTask, formatLeadOtherExtrasLines, updatePropertyRemark } from "@/lib/propstack/client";
import { createRandomToken, getReportExpiryDate } from "@/lib/security/hashToken";
import { absoluteUrl } from "@/lib/site";
import {
  calculateValuation,
  getManualReviewReasonForValuationInput,
  type ValuationInput,
} from "@/lib/valuation/calculateValuation";
import type { LeadReportWithRequest } from "@/lib/types/leadgen";

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

function textOrMissing(value: unknown) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : "k. A.";
}

function formatEuro(value: number | null | undefined) {
  return value == null ? "k. A." : `${Math.round(value).toLocaleString("de-DE")} €`;
}

function formatSquareMeters(value: number | null | undefined) {
  return value == null ? "k. A." : `${Number(value).toLocaleString("de-DE")} m²`;
}

function yesNo(value: boolean | null | undefined) {
  if (value === true) return "ja";
  if (value === false) return "nein";
  return "k. A.";
}

function formatLeadName(lead: NonNullable<Awaited<ReturnType<typeof getLeadRequestById>>>) {
  return [lead.firstname, lead.lastname].map(textOrMissing).filter((value) => value !== "k. A.").join(" ") || "k. A.";
}

function formatLeadAddress(lead: NonNullable<Awaited<ReturnType<typeof getLeadRequestById>>>) {
  return [
    [lead.street, lead.house_number].map(textOrMissing).filter((value) => value !== "k. A.").join(" "),
    [lead.postal_code, lead.city].map(textOrMissing).filter((value) => value !== "k. A.").join(" "),
  ]
    .filter(Boolean)
    .join(", ");
}

type ReportEmailResult = Awaited<ReturnType<typeof sendReportLink>>;

function buildLeadCompletionBody(input: {
  report: LeadReportWithRequest;
  reportUrl: string;
  expiresAt: Date;
  emailResult: ReportEmailResult;
  manualReviewReason?: string | null;
}) {
  const lead = input.report.lead_request;
  const otherExtrasLines = formatLeadOtherExtrasLines(lead);
  const emailWasSent = input.emailResult.provider === "propstack_message";
  const report = input.report;

  return [
    "Leadgenerator Abschluss",
    "",
    "Kontakt",
    `Name: ${formatLeadName(lead)}`,
    `E-Mail: ${textOrMissing(lead.email)}`,
    `Telefon: ${textOrMissing(lead.phone)}`,
    "",
    "Objekt",
    `Adresse: ${formatLeadAddress(lead) || "k. A."}`,
    `Immobilienart: ${objectTypeLabel(lead.object_type)}`,
    `Unterart / Grundstücksangabe: ${textOrMissing(lead.sub_type)}`,
    `Ortsteil: ${textOrMissing(lead.district)}`,
    `Landkreis: ${textOrMissing(lead.landkreis)}`,
    `Koordinaten: ${lead.lat != null && lead.lng != null ? `${lead.lat}, ${lead.lng}` : "k. A."}`,
    "",
    "Objektdaten",
    `Wohnfläche: ${formatSquareMeters(lead.living_area)}`,
    `Grundstück: ${formatSquareMeters(lead.plot_area)}`,
    `Zimmer: ${lead.rooms ?? "k. A."}`,
    `Baujahr: ${lead.construction_year ?? "k. A."}`,
    `Zustand / Erschließung: ${textOrMissing(lead.condition)}`,
    `Ausstattung: ${textOrMissing(lead.equipment)}`,
    `Energieklasse: ${textOrMissing(lead.energy_class)}`,
    `Aufzug: ${yesNo(lead.elevator)}`,
    `Balkon: ${yesNo(lead.balcony)}`,
    `Garten: ${yesNo(lead.garden)}`,
    `Garage/Stellplatz: ${yesNo(lead.garage)}`,
    `Keller: ${yesNo(lead.basement)}`,
    ...(otherExtrasLines.length > 0 ? ["", ...otherExtrasLines] : []),
    "",
    "Motivation",
    `Anlass: ${textOrMissing(lead.reason)}`,
    `Nutzung: ${textOrMissing(lead.selling_intent)}`,
    `Zeithorizont: ${textOrMissing(lead.timeline)}`,
    "",
    "Bewertung",
    `Status: ${input.manualReviewReason ? "persönliche Prüfung erforderlich" : "automatisch vorbereitet"}`,
    input.manualReviewReason ? `Prüfhinweis: ${input.manualReviewReason}` : null,
    `Wertspanne: ${formatEuro(report.range_min)} - ${formatEuro(report.range_max)}`,
    `Orientierungswert: ${formatEuro(report.adjusted_value)}`,
    `Wert pro m²: ${report.price_per_m2_min == null && report.price_per_m2_max == null ? "k. A." : `${report.price_per_m2_min ?? "k. A."} €/m² - ${report.price_per_m2_max ?? "k. A."} €/m²`}`,
    `Datenbasis: ${textOrMissing(report.data_source)}`,
    `Marktebene: ${textOrMissing(report.market_level_used)}`,
    `Sicherheit: ${report.accuracy_score ?? "k. A."}${report.confidence_label ? ` (${report.confidence_label})` : ""}`,
    `Berechnungsnotiz: ${textOrMissing(report.calculation_notes)}`,
    "",
    "Kundenmail",
    `Empfänger: ${textOrMissing(lead.email)}`,
    `Versand: ${emailWasSent ? "per Propstack versendet" : "nicht automatisch versendet"}`,
    input.emailResult.messageId ? `Propstack Message-ID: ${input.emailResult.messageId}` : null,
    "error" in input.emailResult && input.emailResult.error
      ? `Technischer Hinweis: ${input.emailResult.error}`
      : null,
    "",
    "Bewertungslink",
    input.reportUrl,
    `Link gültig bis: ${input.expiresAt.toLocaleDateString("de-DE")}`,
    "",
    "Nächster Schritt",
    "Rückruf / Bewertung prüfen, offene Angaben klären und persönliche Einordnung anbieten.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

async function returnManualReview(
  lead: NonNullable<Awaited<ReturnType<typeof getLeadRequestById>>>,
  reason: string,
  eventReason: string,
) {
  const token = createRandomToken();
  const expiresAt = getReportExpiryDate();
  const report = await createManualLeadReport({ lead, token, expiresAt, reason });
  if (!report) throw new Error("Manueller Bewertungsreport konnte nicht erstellt werden.");

  const reportUrl = absoluteUrl(`/bewertung-ergebnis/${token}`);
  const sent = await sendReportLink({ lead: report, reportUrl });
  const emailWasSent = sent.provider === "propstack_message";
  await syncLeadCompletionToPropstack({
    report,
    reportUrl,
    expiresAt,
    emailResult: sent,
    manualReviewReason: reason,
  });
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

async function syncLeadCompletionToPropstack(input: {
  report: LeadReportWithRequest;
  reportUrl: string;
  expiresAt: Date;
  emailResult: ReportEmailResult;
  manualReviewReason?: string | null;
}) {
  const lead = input.report.lead_request;
  if (!lead.propstack_contact_id && !lead.propstack_property_id) return;

  const body = buildLeadCompletionBody(input);

  try {
    if (lead.propstack_property_id) {
      await updatePropertyRemark(lead.propstack_property_id, body);
    }

    await createTask({
      title: "Rückruf / Bewertung prüfen",
      body,
      contactId: lead.propstack_contact_id,
      propertyId: lead.propstack_property_id,
    });
  } catch (error) {
    await insertLeadEvent({
      leadRequestId: lead.id,
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

  if (lead.status === "report_sent") {
    const latestReport = await getLatestLeadReportByLeadId(lead.id);
    if (latestReport) {
      const manualReview = latestReport.data_source === "manual";

      return {
        success: true as const,
        duplicateSkipped: true as const,
        manualReview: manualReview || undefined,
        reason: manualReview ? latestReport.calculation_notes ?? "Persönliche Prüfung erforderlich." : undefined,
        leadRequestId: lead.id,
        reportId: latestReport.id,
        reportUrl: null,
        expiresAt: latestReport.expires_at,
        range: { min: latestReport.range_min, max: latestReport.range_max },
        value: {
          min: latestReport.range_min,
          mid: latestReport.adjusted_value,
          max: latestReport.range_max,
        },
        confidence: { score: latestReport.accuracy_score, label: latestReport.confidence_label },
        emailProvider: "propstack_message" as const,
        emailSentAt: latestReport.updated_at,
        email: lead.email,
      };
    }
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

  const sent = await sendReportLink({ lead: report, reportUrl });
  const emailWasSent = sent.provider === "propstack_message";
  await syncLeadCompletionToPropstack({
    report,
    reportUrl,
    expiresAt,
    emailResult: sent,
  });
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
