export function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

export function normalizeWhitespace(value: unknown) {
  return normalizeText(value).replace(/\s+/g, " ");
}

export function toLocationSlug(value: unknown) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toJoinKeyPart(value: unknown) {
  return toLocationSlug(value).replace(/-/g, " ");
}

export function normalizeObjectType(value: unknown) {
  const normalized = toLocationSlug(value);
  if (["haus", "house", "haeuser", "hauser"].includes(normalized)) return "haus" as const;
  if (["wohnung", "apartment", "eigentumswohnung", "wohnungen"].includes(normalized)) return "wohnung" as const;
  if (["grundstueck", "grundstuck", "land"].includes(normalized)) return "grundstueck" as const;
  if (["gewerbe", "commercial"].includes(normalized)) return "gewerbe" as const;
  return null;
}

export function normalizePostalCode(value: unknown) {
  const normalized = normalizeText(value);
  return /^\d{5}$/.test(normalized) ? normalized : "";
}

export function parseBooleanLike(value: unknown) {
  if (typeof value === "boolean") return value;
  const normalized = normalizeText(value).toLowerCase();
  return ["ja", "true", "1", "yes", "y"].includes(normalized);
}

export function cleanNullable(value: unknown) {
  const normalized = normalizeWhitespace(value);
  return normalized.length > 0 ? normalized : null;
}
