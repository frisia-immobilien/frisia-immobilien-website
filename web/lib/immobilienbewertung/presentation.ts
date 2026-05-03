import "server-only";

import type {
  LeadSyncCondition,
  LeadSyncHouseType,
  LeadSyncPayload,
  LeadSyncQuality,
  LeadSyncReason,
  LeadSyncUsage,
} from "@/lib/lead-sync";

export function getLeadgenPropertyTypeLabel(
  propertyType: LeadSyncPayload["propertyType"] | null | undefined,
  houseType?: LeadSyncHouseType | string | null,
) {
  if (propertyType === "apartment") return "Wohnung";
  if (propertyType === "land") return "Grundstück";

  switch (houseType) {
    case "single_family":
      return "Einfamilienhaus";
    case "semi_detached":
      return "Doppelhaushälfte";
    case "row_mid":
      return "Reihenmittelhaus";
    case "row_end":
      return "Reihenendhaus";
    case "multi_family":
      return "Mehrfamilienhaus";
    default:
      return "Haus";
  }
}

export function getLeadgenReasonLabel(value: LeadSyncReason | string | undefined | null) {
  switch (value) {
    case "sale":
      return "Verkauf";
    case "buy":
      return "Kauf";
    case "rent_out":
      return "Vermietung";
    default:
      return "k. A.";
  }
}

export function getLeadgenUsageLabel(value: LeadSyncUsage | string | undefined | null) {
  switch (value) {
    case "owner_occupied":
      return "Eigennutzung";
    case "rented":
      return "Vermietet";
    case "vacant":
      return "Leerstehend";
    default:
      return "k. A.";
  }
}

export function getLeadgenConditionLabel(value: LeadSyncCondition | string | undefined | null) {
  switch (value) {
    case "good":
      return "Gut";
    case "normal":
      return "Normal";
    case "needs_work":
      return "Renovierungsbedürftig";
    case "unknown":
    default:
      return "k. A.";
  }
}

export function getLeadgenQualityLabel(value: LeadSyncQuality | string | undefined | null) {
  switch (value) {
    case "simple":
      return "Einfach";
    case "medium":
      return "Mittel";
    case "high":
      return "Gehoben";
    case "very_high":
      return "Gehoben";
    case "unknown":
    default:
      return "k. A.";
  }
}

export function getLeadgenExtraLabel(value: string) {
  const normalized = String(value ?? "").trim().toLowerCase();

  switch (normalized) {
    case "parking":
      return "Stellplatz";
    case "balcony":
      return "Balkon / Terrasse";
    case "garage":
      return "Garage";
    case "guest_wc":
      return "Gäste-WC";
    case "basement":
      return "Keller";
    case "elevator":
      return "Aufzug";
    case "garden":
      return "Garten";
    case "terrace":
      return "Terrasse";
    default:
      return value;
  }
}

export function getLeadgenMarketScopeLabel(scope: string | null | undefined) {
  switch (scope) {
    case "ortsteil":
      return "Ortsteilbasierte Vergleichsdaten";
    case "stadt_gemeinde":
      return "Stadt- und Gemeindedaten";
    case "plz":
      return "PLZ-basierte Vergleichsdaten";
    default:
      return null;
  }
}

export function formatLeadLocationLabel(input: {
  street?: string | null;
  houseNumber?: string | null;
  postalCode?: string | null;
  city?: string | null;
  district?: string | null;
}) {
  const streetLine = [input.street, input.houseNumber].filter(Boolean).join(" ");
  const locality = [input.postalCode, input.city].filter(Boolean).join(" ");
  const district = input.district?.trim() ? input.district.trim() : null;

  return [streetLine, locality, district].filter(Boolean).join(" · ");
}

export function isValidLeadPhone(value: unknown) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return false;
  if (!/^[0-9+()\-/.\s]+$/.test(normalized)) return false;
  const digits = normalized.replace(/\D/g, "");
  return digits.length >= 7;
}
