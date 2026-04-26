export type LeadSyncPropertyType = "house" | "apartment" | "land";
export type LeadSyncHouseType =
  | "single_family"
  | "semi_detached"
  | "row_mid"
  | "row_end"
  | "multi_family";
export type LeadSyncReason = "sale" | "buy" | "rent_out" | "unknown";
export type LeadSyncUsage = "rented" | "owner_occupied" | "vacant" | "unknown";
export type LeadSyncCondition = "unknown" | "good" | "normal" | "needs_work";
export type LeadSyncQuality = "simple" | "medium" | "high" | "very_high" | "unknown";
export type LeadSyncSalutation = "mrs" | "mr" | "none";

export type LeadSyncLocation = {
  postalCode?: string;
  city?: string;
  district?: string;
  street?: string;
  houseNumber?: string;
  regionHint?: "aurich" | "ostfriesland" | "other";
  lat?: number;
  lon?: number;
  canProceed?: boolean;
};

export type LeadSyncPerson = {
  salutation?: LeadSyncSalutation;
  firstName?: string;
  lastName?: string;
  phone?: string;
  notes?: string;
};

export type LeadSyncFacts = {
  livingArea?: number;
  landSize?: number;
  rooms?: number;
  yearBuilt?: number;
  energyClass?: string | null;
  energyKnown?: "unknown" | "yes" | "no";
  condition?: LeadSyncCondition;
  qualityId?: LeadSyncQuality;
  extras?: string[];
  otherExtras?: string;
  otherExtrasValueEur?: number;
  reason?: LeadSyncReason;
  usage?: LeadSyncUsage;
  erschliessung?: "yes" | "partial" | "no";
  bebaubarkeit?: "short_term" | "limited" | "not_buildable" | "unknown";
  bebauungsgebiet?: "wohn" | "gewerbe" | "misch";
};

export type LeadSyncPayload = {
  propertyType?: LeadSyncPropertyType;
  houseType?: LeadSyncHouseType;
  email?: string;
  consent?: boolean;
  location?: LeadSyncLocation;
  person?: LeadSyncPerson;
  facts?: LeadSyncFacts;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

export function normalizeLeadEmail(value: unknown) {
  return normalizeText(value).toLowerCase();
}

export function hasLeadSyncLocation(payload: LeadSyncPayload) {
  const location = payload.location;

  return (
    normalizeText(location?.postalCode).length === 5 &&
    normalizeText(location?.city).length >= 2 &&
    normalizeText(location?.street).length >= 2 &&
    normalizeText(location?.houseNumber).length >= 1
  );
}

export function hasLeadSyncCaptureRequirements(payload: LeadSyncPayload) {
  return hasLeadSyncLocation(payload) && normalizeLeadEmail(payload.email).includes("@") && payload.consent === true;
}

export function hasLeadSyncPersonData(payload: LeadSyncPayload) {
  const person = payload.person;

  return Boolean(
    normalizeText(person?.firstName) ||
      normalizeText(person?.lastName) ||
      normalizeText(person?.phone) ||
      normalizeText(person?.notes) ||
      (person?.salutation && person.salutation !== "none"),
  );
}

export function buildLeadSyncFingerprint(payload: LeadSyncPayload) {
  const location = payload.location;
  const parts = [
    normalizeLeadEmail(payload.email),
    normalizeText(location?.postalCode).toLowerCase(),
    normalizeText(location?.city).toLowerCase(),
    normalizeText(location?.street).toLowerCase(),
    normalizeText(location?.houseNumber).toLowerCase(),
  ].filter(Boolean);

  if (parts.length < 5) {
    throw new Error("Lead-Fingerprint kann erst mit Adresse und E-Mail gebildet werden.");
  }

  return parts.join("|");
}

export function mergeLeadSyncPayload(
  base: LeadSyncPayload | null | undefined,
  patch: LeadSyncPayload | null | undefined,
): LeadSyncPayload {
  if (!base) return patch ?? {};
  if (!patch) return base;

  const output: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;

    const current = output[key];

    if (isPlainObject(current) && isPlainObject(value)) {
      output[key] = mergeLeadSyncPayload(
        current as LeadSyncPayload,
        value as LeadSyncPayload,
      ) as unknown;
      continue;
    }

    output[key] = value;
  }

  return output as LeadSyncPayload;
}
