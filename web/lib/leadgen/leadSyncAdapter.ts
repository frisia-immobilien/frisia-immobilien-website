import "server-only";

import type { LeadSyncPayload } from "@/lib/lead-sync";
import type { LeadPayload } from "@/lib/leadgen/validation";

function text(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

function number(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapObjectType(value: LeadSyncPayload["propertyType"]): LeadPayload["object_type"] {
  if (value === "house") return "haus";
  if (value === "apartment") return "wohnung";
  if (value === "land") return "grundstueck";
  return null;
}

function mapCondition(value: unknown) {
  if (value === "good") return "gut";
  if (value === "normal") return "normal";
  if (value === "needs_work") return "sanierungsbeduerftig";
  if (value === "unknown") return "unbekannt";
  return null;
}

function mapQuality(value: unknown) {
  if (value === "simple") return "einfach";
  if (value === "medium") return "normal";
  if (value === "high") return "gehoben";
  if (value === "very_high") return "sehr_hoch";
  if (value === "unknown") return "unbekannt";
  return null;
}

function mapReason(value: unknown) {
  if (value === "sale") return "verkauf";
  if (value === "buy") return "kauf";
  if (value === "rent_out") return "vermietung";
  if (value === "unknown") return "unbekannt";
  return null;
}

function mapUsage(value: unknown) {
  if (value === "rented") return "vermietet";
  if (value === "owner_occupied") return "eigennutzung";
  if (value === "vacant") return "leerstand";
  if (value === "unknown") return "unbekannt";
  return null;
}

function mapLandStatus(value: unknown) {
  if (value === "yes") return "erschlossen";
  if (value === "partial") return "teilerschlossen";
  if (value === "no") return "nicht_erschlossen";
  if (value === "short_term") return "kurzfristig_bebaubar";
  if (value === "limited") return "eingeschraenkt_bebaubar";
  if (value === "not_buildable") return "nicht_bebaubar";
  if (value === "unknown") return "unbekannt";
  return text(value);
}

function hasExtra(payload: LeadSyncPayload, key: string) {
  return Array.isArray(payload.facts?.extras) && payload.facts.extras.includes(key);
}

export function mapLeadSyncPayloadToLeadPayload(payload: LeadSyncPayload): LeadPayload {
  const objectType = mapObjectType(payload.propertyType);
  const landSubType = [mapLandStatus(payload.facts?.bebaubarkeit), mapLandStatus(payload.facts?.bebauungsgebiet)]
    .filter(Boolean)
    .join(" / ");

  return {
    id: null,
    email: text(payload.email)?.toLowerCase() ?? null,
    firstname: text(payload.person?.firstName),
    lastname: text(payload.person?.lastName),
    phone: text(payload.person?.phone),
    object_type: objectType,
    sub_type: objectType === "grundstueck" ? landSubType || null : text(payload.houseType),
    reason: mapReason(payload.facts?.reason),
    selling_intent: mapUsage(payload.facts?.usage),
    timeline: null,
    street: text(payload.location?.street),
    house_number: text(payload.location?.houseNumber),
    postal_code: text(payload.location?.postalCode),
    city: text(payload.location?.city),
    district: text(payload.location?.district),
    landkreis: null,
    lat: number(payload.location?.lat),
    lng: number(payload.location?.lon),
    living_area: number(payload.facts?.livingArea),
    plot_area: number(payload.facts?.landSize),
    rooms: number(payload.facts?.rooms),
    construction_year: number(payload.facts?.yearBuilt),
    condition: objectType === "grundstueck" ? mapLandStatus(payload.facts?.erschliessung) : mapCondition(payload.facts?.condition),
    equipment: mapQuality(payload.facts?.qualityId),
    energy_class: text(payload.facts?.energyClass),
    floor: null,
    elevator: hasExtra(payload, "elevator"),
    balcony: hasExtra(payload, "balcony"),
    garden: hasExtra(payload, "garden"),
    garage: hasExtra(payload, "garage") || hasExtra(payload, "parking"),
    basement: hasExtra(payload, "basement"),
    renovation_status: mapCondition(payload.facts?.condition),
    heating_type: null,
    consent_given: payload.consent === true,
    privacy_version: "2026-04-26",
    marketing_consent: false,
  };
}
