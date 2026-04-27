import type { DataSource, MarketLevelUsed, ObjectType } from "@/lib/types/leadgen";
import type { ResolvedMarketData } from "@/lib/market/resolveMarketData";
import { calculateRange } from "@/lib/valuation/calculateRange";

type ResidentialValuationInput = {
  object_type: Extract<ObjectType, "haus" | "wohnung">;
  living_area: number;
  plot_area?: number | null;
  rooms?: number | null;
  construction_year?: number | null;
  condition?: string | null;
  equipment?: string | null;
  energy_class?: string | null;
  elevator?: boolean | null;
  balcony?: boolean | null;
  garden?: boolean | null;
  garage?: boolean | null;
  basement?: boolean | null;
  market: ResolvedMarketData;
};

type LandValuationInput = {
  object_type: "grundstueck";
  plot_area: number;
  bodenrichtwert_eur_m2: number;
  market_level_used?: MarketLevelUsed;
};

export type ValuationInput = ResidentialValuationInput | LandValuationInput;

export type ValuationResult = {
  base_value: number;
  adjusted_value: number;
  range_min: number;
  range_max: number;
  price_per_m2_min: number | null;
  price_per_m2_max: number | null;
  data_source: DataSource;
  market_level_used: MarketLevelUsed;
  accuracy_score: number;
  confidence_label: string;
  calculation_notes: string;
};

function normalize(value: string | null | undefined) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function conditionFactor(value: string | null | undefined) {
  const normalized = normalize(value);
  if (normalized.includes("sanier") || normalized.includes("renovierungs") || normalized.includes("needs")) return 0.92;
  if (normalized.includes("einfach") || normalized.includes("normal")) return 0.98;
  if (normalized.includes("gut") || normalized.includes("gepflegt")) return 1.04;
  if (normalized.includes("neu") || normalized.includes("modern")) return 1.07;
  return 1;
}

function equipmentFactor(value: string | null | undefined) {
  const normalized = normalize(value);
  if (normalized.includes("einfach") || normalized.includes("simple")) return 0.96;
  if (normalized.includes("gehoben") || normalized.includes("hoch")) return 1.04;
  if (normalized.includes("lux") || normalized.includes("sehr")) return 1.07;
  return 1;
}

function constructionYearFactor(year: number | null | undefined) {
  if (!year || !Number.isFinite(year)) return 1;
  if (year < 1950) return 0.96;
  if (year < 1978) return 0.98;
  if (year >= 2021) return 1.06;
  if (year >= 2015) return 1.04;
  if (year >= 2000) return 1.02;
  return 1;
}

function energyFactor(value: string | null | undefined) {
  const normalized = normalize(value).toUpperCase();
  if (["A+", "A", "B"].includes(normalized)) return 1.03;
  if (normalized === "C") return 1.015;
  if (normalized === "E") return 0.985;
  if (normalized === "F") return 0.96;
  if (normalized === "G") return 0.93;
  if (normalized === "H") return 0.9;
  return 1;
}

function extrasFactor(input: ResidentialValuationInput) {
  let factor = 1;
  if (input.object_type === "wohnung" && input.elevator) factor += 0.015;
  if (input.balcony) factor += 0.015;
  if (input.garden && input.object_type === "haus") factor += 0.01;
  if (input.garage) factor += 0.015;
  if (input.basement) factor += 0.0075;
  return factor;
}

function plotFactor(input: ResidentialValuationInput) {
  if (input.object_type !== "haus" || !input.plot_area || !input.living_area) return 1;
  const ratio = input.plot_area / input.living_area;
  if (ratio >= 8) return 1.04;
  if (ratio >= 5) return 1.02;
  if (ratio < 2) return 0.98;
  return 1;
}

function confidence(level: MarketLevelUsed, salesCount: number | null | undefined) {
  const count = salesCount ?? 0;
  let score = 35;
  if (level === "ortsteil") score += 35;
  if (level === "stadt_gemeinde") score += 25;
  if (level === "landkreis") score += 15;
  if (level === "region") score += 10;
  if (level === "boris_zone") score += 30;
  if (count >= 50) score += 25;
  else if (count >= 20) score += 18;
  else if (count >= 10) score += 10;
  else if (count > 0) score += 4;
  score = Math.max(0, Math.min(95, score));
  const label = score >= 78 ? "hoch" : score >= 58 ? "mittel" : "niedriger";
  return { score, label };
}

export function calculateValuation(input: ValuationInput): ValuationResult {
  if (input.object_type === "grundstueck") {
    const base = input.plot_area * input.bodenrichtwert_eur_m2;
    const range = calculateRange(base);
    const confidenceValue = confidence(input.market_level_used ?? "boris_zone", 1);
    return {
      base_value: Math.round(base),
      ...range,
      price_per_m2_min: Math.round(range.range_min / input.plot_area),
      price_per_m2_max: Math.round(range.range_max / input.plot_area),
      data_source: "boris",
      market_level_used: input.market_level_used ?? "boris_zone",
      accuracy_score: confidenceValue.score,
      confidence_label: confidenceValue.label,
      calculation_notes:
        "Erste Marktpreiseinschätzung auf Basis des Bodenrichtwerts und der angegebenen Grundstücksfläche.",
    };
  }

  const base = input.living_area * input.market.median_preis_eur_m2;
  const factor = Math.max(
    0.85,
    Math.min(
      1.15,
      conditionFactor(input.condition) *
        equipmentFactor(input.equipment) *
        constructionYearFactor(input.construction_year) *
        energyFactor(input.energy_class) *
        extrasFactor(input) *
        plotFactor(input),
    ),
  );
  const adjusted = base * factor;
  const range = calculateRange(adjusted);
  const confidenceValue = confidence(input.market.market_level_used, input.market.verkaeufe_anzahl);

  return {
    base_value: Math.round(base),
    ...range,
    price_per_m2_min: Math.round(range.range_min / input.living_area),
    price_per_m2_max: Math.round(range.range_max / input.living_area),
    data_source: "frisia_market_db",
    market_level_used: input.market.market_level_used,
    accuracy_score: confidenceValue.score,
    confidence_label: confidenceValue.label,
    calculation_notes:
      "Automatisierte erste Marktpreiseinschätzung auf Basis regionaler Vergleichsdaten und der Nutzereingaben. Keine Verkehrswertermittlung.",
  };
}
