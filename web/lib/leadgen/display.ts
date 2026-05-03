export type EquipmentDisplayStage = "einfach" | "mittel" | "gehoben" | "stark gehoben";

function normalizeDisplayValue(value: string | null | undefined) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

export function formatLeadgenEquipmentLabel(value: string | null | undefined) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const normalized = normalizeDisplayValue(raw);
  if (!normalized || normalized === "unbekannt" || normalized === "unknown" || normalized === "k a") return null;
  if (normalized.includes("einfach") || normalized.includes("simple") || normalized.includes("basic")) {
    return "einfach";
  }
  if (normalized.includes("mittel") || normalized.includes("normal") || normalized.includes("medium") || normalized.includes("standard")) {
    return "mittel";
  }
  if (normalized.includes("stark gehoben") || normalized.includes("luxus") || normalized.includes("premium")) {
    return "stark gehoben";
  }
  if (normalized.includes("sehr hoch") || normalized.includes("sehr gehoben") || normalized.includes("very high")) {
    return "gehoben";
  }
  if (normalized.includes("gehoben") || normalized.includes("hoch") || normalized.includes("high")) {
    return "gehoben";
  }

  return raw.replace(/[_-]+/g, " ");
}

export function getLeadgenEquipmentStage(value: string | null | undefined): EquipmentDisplayStage | null {
  const label = formatLeadgenEquipmentLabel(value);
  if (label === "einfach" || label === "mittel" || label === "gehoben" || label === "stark gehoben") {
    return label;
  }

  return null;
}
