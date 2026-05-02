import type { DataSource, MarketLevelUsed, ObjectType } from "@/lib/types/leadgen";
import type { ResolvedMarketData } from "@/lib/market/resolveMarketData";
import { roundEuroToThousand } from "@/lib/valuation/calculateRange";

type ResidentialValuationInput = {
  object_type: Extract<ObjectType, "haus" | "wohnung">;
  sub_type?: string | null;
  living_area: number;
  plot_area?: number | null;
  rooms?: number | null;
  construction_year?: number | null;
  condition?: string | null;
  equipment?: string | null;
  energy_class?: string | null;
  reason?: string | null;
  selling_intent?: string | null;
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
  erschliessung?: string | null;
  bebaubarkeit?: string | null;
  bebauungsgebiet?: string | null;
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

function normalize(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

type AdjustmentResult = {
  adjustment: number;
  manualReviewReason?: string;
};

function finiteNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function roundEuro(value: number, step = 1000, mode: "round" | "floor" | "ceil" = "round") {
  const safeValue = Number.isFinite(value) ? value : 0;
  const scaled = safeValue / step;
  if (mode === "floor") return Math.floor(scaled) * step;
  if (mode === "ceil") return Math.ceil(scaled) * step;
  return Math.round(scaled) * step;
}

function conditionAdjustment(value: string | null | undefined): AdjustmentResult {
  const normalized = normalize(value);

  if (normalized.includes("abriss")) {
    return { adjustment: 0, manualReviewReason: "Abrissobjekte werden manuell geprüft." };
  }

  if (normalized.includes("stark") && normalized.includes("sanier")) return { adjustment: -0.3 };
  if (normalized.includes("sanier")) return { adjustment: -0.22 };
  if (normalized.includes("leicht") && normalized.includes("renov")) return { adjustment: -0.06 };
  if (normalized.includes("renov") || normalized.includes("needs")) return { adjustment: -0.13 };
  if (normalized.includes("gepflegt") || normalized.includes("normal") || normalized.includes("durchschnitt"))
    return { adjustment: 0 };
  if (normalized.includes("neu") || normalized.includes("modern")) return { adjustment: 0.08 };
  if (normalized.includes("gut")) return { adjustment: 0 };
  return { adjustment: 0 };
}

function constructionYearAdjustment(year: number | null | undefined) {
  if (!year || !Number.isFinite(year)) return 0;
  if (year >= 2016) return 0.08;
  if (year >= 2010) return 0.04;
  if (year >= 1995) return 0;
  if (year >= 1978) return -0.04;
  if (year >= 1950) return -0.08;
  if (year >= 1900) return -0.1;
  return -0.12;
}

function equipmentAdjustment(value: string | null | undefined) {
  const normalized = normalize(value);
  if (normalized.includes("sehr") || normalized.includes("hoch")) return 0.1;
  if (normalized.includes("gehoben")) return 0.06;
  if (normalized.includes("einfach")) return -0.05;
  return 0;
}

function energyAdjustment(value: string | null | undefined) {
  const raw = normalize(value);
  const compact = raw.replace(/[\s.]/g, "");
  if (!raw || raw.includes("keine") || raw.includes("unbekannt") || compact === "ka") return 0;
  const normalized = raw.replace(/[^a-h+]/g, "");
  if (normalized.includes("a+")) return 0.045;
  if (normalized.includes("a")) return 0.04;
  if (normalized.includes("b")) return 0.03;
  if (normalized.includes("c")) return 0.015;
  if (normalized.includes("d")) return 0;
  if (normalized.includes("e")) return -0.02;
  if (normalized.includes("f")) return -0.04;
  if (normalized.includes("g")) return -0.06;
  if (normalized.includes("h")) return -0.08;
  return 0;
}

function subtypeAdjustment(input: ResidentialValuationInput) {
  const normalized = normalize(input.sub_type);
  if (input.object_type === "wohnung") {
    if (normalized.includes("penthouse")) return 0.08;
    if (normalized.includes("maisonette")) return 0.03;
    if (normalized.includes("dach")) return -0.015;
    if (normalized.includes("erd")) return 0.015;
    return 0;
  }

  if (normalized.includes("multi") || normalized.includes("mehrfamilien")) return -0.03;
  if (normalized.includes("semi") || normalized.includes("doppel")) return -0.025;
  if (normalized.includes("row_mid") || normalized.includes("reihenmittel")) return -0.055;
  if (normalized.includes("row_end") || normalized.includes("reihenend")) return -0.035;
  return 0;
}

function plotAdjustment(input: ResidentialValuationInput) {
  if (input.object_type !== "haus") return 0;
  const livingArea = finiteNumber(input.living_area);
  const plotArea = finiteNumber(input.plot_area);
  if (!livingArea || !plotArea || livingArea <= 0 || plotArea <= 0) return 0;
  const ratio = plotArea / livingArea;
  if (ratio < 1.8) return -0.03;
  if (ratio < 2.7) return -0.015;
  if (ratio <= 4.8) return 0;
  if (ratio <= 7.5) return 0.02;
  if (ratio <= 12) return 0.035;
  return 0.045;
}

function roomsAdjustment(input: ResidentialValuationInput) {
  const livingArea = finiteNumber(input.living_area);
  const rooms = finiteNumber(input.rooms);
  if (!livingArea || !rooms || livingArea <= 0 || rooms <= 0) return 0;
  const areaPerRoom = livingArea / rooms;
  if (areaPerRoom < 17) return -0.02;
  if (areaPerRoom > 55) return 0.01;
  return 0;
}

function extrasAdjustment(input: ResidentialValuationInput) {
  let adjustment = 0;
  if (input.garage) adjustment += input.object_type === "haus" ? 0.015 : 0.01;
  if (input.garden) adjustment += input.object_type === "haus" ? 0.01 : 0.015;
  if (input.balcony) adjustment += input.object_type === "wohnung" ? 0.012 : 0.006;
  if (input.basement) adjustment += 0.005;
  if (input.object_type === "wohnung" && input.elevator) adjustment += 0.02;
  return adjustment;
}

function usageAdjustment(input: ResidentialValuationInput) {
  const usage = normalize(input.selling_intent);
  if (usage.includes("vermietet")) return input.object_type === "wohnung" ? -0.025 : -0.015;
  if (usage.includes("leerstand")) return 0.01;
  return 0;
}

function missingQualityCount(input: ResidentialValuationInput) {
  return [
    input.construction_year,
    input.condition,
    input.equipment,
    input.energy_class,
  ].filter((value) => normalize(value).length === 0 || normalize(value) === "unbekannt").length;
}

function valuationAdjustment(input: ResidentialValuationInput): AdjustmentResult {
  const condition = conditionAdjustment(input.condition);
  if (condition.manualReviewReason) return condition;

  const rawAdjustment =
    condition.adjustment +
    constructionYearAdjustment(input.construction_year) +
    equipmentAdjustment(input.equipment) +
    energyAdjustment(input.energy_class) +
    subtypeAdjustment(input) +
    plotAdjustment(input) +
    roomsAdjustment(input) +
    extrasAdjustment(input) +
    usageAdjustment(input);

  if (rawAdjustment < -0.38) {
    return {
      adjustment: rawAdjustment,
      manualReviewReason:
        "Der rechnerische Gesamtabschlag ist ungewöhnlich hoch. Die Immobilie wird deshalb persönlich geprüft.",
    };
  }

  return { adjustment: clamp(rawAdjustment, -0.35, 0.28) };
}

export function getManualReviewReasonForValuationInput(input: ValuationInput) {
  if (input.object_type === "grundstueck") return null;
  return valuationAdjustment(input).manualReviewReason ?? null;
}

function confidence(level: MarketLevelUsed, salesCount: number | null | undefined, unknownCount = 0, hasQuantiles = false) {
  const count = salesCount ?? 0;
  let score = 42;
  if (level === "ortsteil") score += 25;
  if (level === "stadt_gemeinde") score += 18;
  if (level === "landkreis") score += 10;
  if (level === "region") score += 6;
  if (level === "boris_zone") score += 18;
  if (count >= 150) score += 18;
  else if (count >= 75) score += 16;
  else if (count >= 35) score += 13;
  else if (count >= 15) score += 9;
  else if (count > 0) score += 4;
  if (hasQuantiles) score += 5;
  score -= unknownCount * 3;
  score = Math.max(35, Math.min(95, score));
  const label = score >= 78 ? "hoch" : score >= 58 ? "mittel" : "niedriger";
  return { score, label };
}

function baseRangeByMarket(level: MarketLevelUsed, salesCount: number | null | undefined) {
  const count = salesCount ?? 0;
  if (level === "ortsteil") {
    if (count >= 50) return 0.075;
    if (count >= 25) return 0.085;
    if (count >= 10) return 0.1;
    return 0.115;
  }
  if (level === "stadt_gemeinde") {
    if (count >= 150) return 0.09;
    if (count >= 50) return 0.105;
    if (count >= 15) return 0.12;
    return 0.14;
  }
  if (level === "landkreis") return 0.145;
  if (level === "region") return 0.16;
  return 0.12;
}

function dynamicResidentialRange(input: ResidentialValuationInput, adjustedValue: number, adjustedRate: number) {
  const q1 = finiteNumber(input.market.quantil_01_preis_eur_m2);
  const q9 = finiteNumber(input.market.quantil_09_preis_eur_m2);
  const baseRange =
    baseRangeByMarket(input.market.market_level_used, input.market.verkaeufe_anzahl) +
    missingQualityCount(input) * 0.006;

  let lowerFactor = baseRange;
  let upperFactor = baseRange;

  if (q1 && q9 && q1 > 0 && q9 > q1 && adjustedRate > 0) {
    const lowerMarketSpread = clamp(((adjustedRate - q1) / adjustedRate) * 0.42, 0.055, 0.18);
    const upperMarketSpread = clamp(((q9 - adjustedRate) / adjustedRate) * 0.42, 0.06, 0.2);
    lowerFactor = Math.max(lowerFactor, lowerMarketSpread);
    upperFactor = Math.max(upperFactor, upperMarketSpread);
  }

  const normalizedCondition = normalize(input.condition);
  if (normalizedCondition.includes("sanier")) {
    lowerFactor += 0.015;
    upperFactor += 0.005;
  } else if (normalizedCondition.includes("renov")) {
    lowerFactor += 0.008;
  }

  lowerFactor = clamp(lowerFactor, 0.07, 0.2);
  upperFactor = clamp(upperFactor, 0.08, 0.22);

  const adjusted = roundEuro(adjustedValue, 1000);
  return {
    adjusted_value: adjusted,
    range_min: Math.max(1000, roundEuro(adjustedValue * (1 - lowerFactor), 5000, "floor")),
    range_max: Math.max(1000, roundEuro(adjustedValue * (1 + upperFactor), 5000, "ceil")),
  };
}

function clampAdjustedRateToMarket(input: ResidentialValuationInput, adjustedRate: number) {
  const q1 = finiteNumber(input.market.quantil_01_preis_eur_m2);
  const q9 = finiteNumber(input.market.quantil_09_preis_eur_m2);
  if (!q1 || !q9 || q1 <= 0 || q9 <= q1) return adjustedRate;
  return clamp(adjustedRate, q1 * 0.92, q9 * 1.08);
}

function landAdjustment(input: LandValuationInput) {
  const erschliessung = normalize(input.erschliessung);
  const bebaubarkeit = normalize(input.bebaubarkeit);
  const bebauungsgebiet = normalize(input.bebauungsgebiet);

  let adjustment = 0;

  if (erschliessung.includes("teilerschlossen")) adjustment += 0.01;
  else if (erschliessung.includes("nicht") || erschliessung.includes("unerschlossen")) adjustment -= 0.08;
  else if (erschliessung.includes("erschlossen")) adjustment += 0.04;

  if (bebaubarkeit.includes("kurzfristig")) adjustment += 0.05;
  else if (bebaubarkeit.includes("eingeschraenkt") || bebaubarkeit.includes("eingeschränkt")) adjustment -= 0.04;
  else if (bebaubarkeit.includes("nicht")) adjustment -= 0.16;

  if (bebauungsgebiet.includes("wohn")) adjustment += 0.03;
  else if (bebauungsgebiet.includes("misch")) adjustment += 0.01;
  else if (bebauungsgebiet.includes("gewerbe")) adjustment -= 0.03;

  return clamp(adjustment, -0.24, 0.14);
}

function landRange(input: LandValuationInput, adjustedValue: number) {
  const bebaubarkeit = normalize(input.bebaubarkeit);
  const erschliessung = normalize(input.erschliessung);
  let rangeFactor = 0.12;

  if (bebaubarkeit.includes("unbekannt")) rangeFactor += 0.025;
  if (bebaubarkeit.includes("eingeschraenkt") || bebaubarkeit.includes("eingeschränkt")) rangeFactor += 0.015;
  if (bebaubarkeit.includes("nicht")) rangeFactor += 0.035;
  if (erschliessung.includes("teilerschlossen")) rangeFactor += 0.01;
  if (erschliessung.includes("nicht") || erschliessung.includes("unerschlossen")) rangeFactor += 0.02;

  rangeFactor = clamp(rangeFactor, 0.12, 0.18);
  const adjusted = roundEuro(adjustedValue, 1000);
  return {
    adjusted_value: adjusted,
    range_min: Math.max(1000, roundEuro(adjustedValue * (1 - rangeFactor), 5000, "floor")),
    range_max: Math.max(1000, roundEuro(adjustedValue * (1 + rangeFactor), 5000, "ceil")),
  };
}

export function calculateValuation(input: ValuationInput): ValuationResult {
  if (input.object_type === "grundstueck") {
    const base = input.plot_area * input.bodenrichtwert_eur_m2;
    const adjustment = landAdjustment(input);
    const adjusted = base * (1 + adjustment);
    const range = landRange(input, adjusted);
    const confidenceValue = confidence(input.market_level_used ?? "boris_zone", 75);
    return {
      base_value: roundEuroToThousand(base),
      ...range,
      price_per_m2_min: Math.round(range.range_min / input.plot_area),
      price_per_m2_max: Math.round(range.range_max / input.plot_area),
      data_source: "boris",
      market_level_used: input.market_level_used ?? "boris_zone",
      accuracy_score: confidenceValue.score,
      confidence_label: confidenceValue.label,
      calculation_notes:
        `Erste Marktpreiseinschätzung auf Basis des BORIS-Bodenrichtwerts (${Math.round(input.bodenrichtwert_eur_m2).toLocaleString("de-DE")} €/m²), der Grundstücksfläche sowie Zu- und Abschlägen für Erschließung, Bebaubarkeit und Gebietstyp. Keine Verkehrswertermittlung.`,
    };
  }

  const base = input.living_area * input.market.median_preis_eur_m2;
  const adjustment = valuationAdjustment(input);
  if (adjustment.manualReviewReason) {
    throw new Error(adjustment.manualReviewReason);
  }

  const adjustedRate = clampAdjustedRateToMarket(input, input.market.median_preis_eur_m2 * (1 + adjustment.adjustment));
  const adjusted = input.living_area * adjustedRate;
  const range = dynamicResidentialRange(input, adjusted, adjustedRate);
  const hasQuantiles = Boolean(input.market.quantil_01_preis_eur_m2 && input.market.quantil_09_preis_eur_m2);
  const confidenceValue = confidence(
    input.market.market_level_used,
    input.market.verkaeufe_anzahl,
    missingQualityCount(input),
    hasQuantiles,
  );

  return {
    base_value: roundEuroToThousand(base),
    ...range,
    price_per_m2_min: Math.round(range.range_min / input.living_area),
    price_per_m2_max: Math.round(range.range_max / input.living_area),
    data_source: "frisia_market_db",
    market_level_used: input.market.market_level_used,
    accuracy_score: confidenceValue.score,
    confidence_label: confidenceValue.label,
    calculation_notes:
      "Automatisierte erste Marktpreiseinschätzung auf Basis der lokalen Marktdaten, der verwendeten Marktebene, der Transaktionsanzahl und objektbezogener Zu- und Abschläge. Keine Verkehrswertermittlung.",
  };
}
