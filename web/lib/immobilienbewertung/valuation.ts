import "server-only";

import { sql } from "@/lib/db";
import type {
  LeadSyncCondition,
  LeadSyncPayload,
  LeadSyncQuality,
  LeadSyncReason,
  LeadSyncUsage,
} from "@/lib/lead-sync";
import type { MarketRecord } from "@/lib/immobilienbewertung/market-data";

type PlzMedianRow = {
  plz: string;
  house_eur_m2: number;
  apartment_eur_m2: number;
  land_eur_m2: number;
};

export type LeadValuationBreakdown = {
  baseRatePerSqm: number | null;
  baseSource: "market_master" | "plz_medians" | "fallback";
  appliedFactor: number;
  extrasEuro: number;
  rangeFactor: number;
  modifiers: Array<{ label: string; factor?: number; euro?: number }>;
};

export type LeadValuationResult = {
  marketRecord: MarketRecord | null;
  marketScope: "ortsteil" | "stadt_gemeinde" | "plz" | "none";
  valueMid: number;
  valueMin: number;
  valueMax: number;
  displayMid: string;
  displayRange: string;
  breakdown: LeadValuationBreakdown;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundTo(value: number, step: number, mode: "round" | "floor" | "ceil" = "round") {
  if (mode === "floor") return Math.floor(value / step) * step;
  if (mode === "ceil") return Math.ceil(value / step) * step;
  return Math.round(value / step) * step;
}

function euro(value: number) {
  return `${value.toLocaleString("de-DE")} €`;
}

function safeNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function getPlzMedianRates(postalCode: string) {
  if (!postalCode) return null;

  const rows = (await sql`
    SELECT plz, house_eur_m2, apartment_eur_m2, land_eur_m2
    FROM plz_medians
    WHERE plz = ${postalCode}
    LIMIT 1
  `) as PlzMedianRow[];

  return rows[0] ?? null;
}

function getResidentialArea(payload: LeadSyncPayload) {
  if (payload.propertyType === "land") return safeNumber(payload.facts?.landSize) ?? 0;
  return safeNumber(payload.facts?.livingArea) ?? 0;
}

function getBaseRate(payload: LeadSyncPayload, marketRecord: MarketRecord | null, plzMedians: PlzMedianRow | null) {
  if (payload.propertyType === "house" && safeNumber(marketRecord?.median_preis_eur_m2)) {
    return {
      rate: Number(marketRecord?.median_preis_eur_m2),
      source: "market_master" as const,
    };
  }

  if (plzMedians) {
    if (payload.propertyType === "apartment" && safeNumber(plzMedians.apartment_eur_m2)) {
      return { rate: Number(plzMedians.apartment_eur_m2), source: "plz_medians" as const };
    }
    if (payload.propertyType === "land" && safeNumber(plzMedians.land_eur_m2)) {
      return { rate: Number(plzMedians.land_eur_m2), source: "plz_medians" as const };
    }
    if (payload.propertyType === "house" && safeNumber(plzMedians.house_eur_m2)) {
      return { rate: Number(plzMedians.house_eur_m2), source: "plz_medians" as const };
    }
  }

  if (safeNumber(marketRecord?.median_preis_eur_m2)) {
    return {
      rate: Number(marketRecord?.median_preis_eur_m2),
      source: "market_master" as const,
    };
  }

  return {
    rate: payload.propertyType === "land" ? 220 : payload.propertyType === "apartment" ? 2450 : 2150,
    source: "fallback" as const,
  };
}

function getHouseTypeFactor(payload: LeadSyncPayload) {
  switch (payload.houseType) {
    case "semi_detached":
      return 0.97;
    case "row_mid":
      return 0.94;
    case "row_end":
      return 0.96;
    case "multi_family":
      return 1.04;
    case "single_family":
    default:
      return 1;
  }
}

function getYearFactor(yearBuilt?: number | null) {
  if (!yearBuilt || !Number.isFinite(yearBuilt)) return 1;
  if (yearBuilt < 1950) return 0.92;
  if (yearBuilt < 1979) return 0.96;
  if (yearBuilt < 2000) return 1;
  if (yearBuilt < 2016) return 1.05;
  return 1.1;
}

function getConditionFactor(condition?: LeadSyncCondition) {
  switch (condition) {
    case "needs_work":
      return 0.86;
    case "normal":
      return 0.97;
    case "good":
      return 1.05;
    default:
      return 1;
  }
}

function getQualityFactor(quality?: LeadSyncQuality) {
  switch (quality) {
    case "simple":
      return 0.94;
    case "medium":
      return 1;
    case "high":
      return 1.07;
    case "very_high":
      return 1.12;
    default:
      return 1;
  }
}

function getEnergyFactor(energyClass?: string | null) {
  const normalized = String(energyClass ?? "").trim().toUpperCase();
  if (!normalized) return 1;
  if (["A+", "A", "B"].includes(normalized)) return 1.04;
  if (normalized === "C") return 1.02;
  if (normalized === "D") return 1;
  if (normalized === "E") return 0.98;
  if (normalized === "F") return 0.95;
  if (normalized === "G") return 0.91;
  if (normalized === "H") return 0.88;
  return 1;
}

function getUsageFactor(usage?: LeadSyncUsage) {
  switch (usage) {
    case "rented":
      return 0.97;
    case "vacant":
      return 0.99;
    default:
      return 1;
  }
}

function getReasonFactor(reason?: LeadSyncReason) {
  switch (reason) {
    case "rent_out":
      return 0.98;
    case "buy":
      return 1.01;
    default:
      return 1;
  }
}

function getExtrasAdjustment(payload: LeadSyncPayload) {
  const extras = new Set(payload.facts?.extras ?? []);
  const modifiers: Array<{ label: string; factor?: number; euro?: number }> = [];
  let factor = 1;
  let euroBonus = 0;

  const factorExtras: Array<[string, string, number]> = [
    ["parking", "Stellplatz", 0.01],
    ["balcony", "Balkon / Terrasse", 0.015],
    ["garage", "Garage", 0.02],
    ["guest_wc", "Gäste-WC", 0.005],
    ["basement", "Keller", 0.0075],
  ];

  for (const [id, label, bonus] of factorExtras) {
    if (!extras.has(id)) continue;
    factor += bonus;
    modifiers.push({ label, factor: bonus });
  }

  if (extras.has("elevator") && payload.propertyType === "apartment") {
    factor += 0.015;
    modifiers.push({ label: "Aufzug", factor: 0.015 });
  }

  const otherExtrasValue = safeNumber((payload.facts as { otherExtrasValueEur?: number } | undefined)?.otherExtrasValueEur);
  if (otherExtrasValue && otherExtrasValue > 0) {
    euroBonus += otherExtrasValue;
    modifiers.push({ label: "Weitere Extras", euro: otherExtrasValue });
  }

  return { factor, euroBonus, modifiers };
}

function getLandSpecificFactor(payload: LeadSyncPayload) {
  const facts = payload.facts as LeadSyncPayload["facts"] & {
    erschliessung?: "yes" | "partial" | "no";
    bebaubarkeit?: "short_term" | "limited" | "not_buildable" | "unknown";
    bebauungsgebiet?: "wohn" | "gewerbe" | "misch";
  };

  let factor = 1;
  const modifiers: Array<{ label: string; factor?: number }> = [];

  switch (facts.erschliessung) {
    case "yes":
      factor += 0.04;
      modifiers.push({ label: "Erschlossen", factor: 0.04 });
      break;
    case "partial":
      factor += 0.01;
      modifiers.push({ label: "Teilerschlossen", factor: 0.01 });
      break;
    case "no":
      factor -= 0.08;
      modifiers.push({ label: "Unerschlossen", factor: -0.08 });
      break;
    default:
      break;
  }

  switch (facts.bebaubarkeit) {
    case "short_term":
      factor += 0.05;
      modifiers.push({ label: "Kurzfristig bebaubar", factor: 0.05 });
      break;
    case "limited":
      factor -= 0.04;
      modifiers.push({ label: "Eingeschränkt bebaubar", factor: -0.04 });
      break;
    case "not_buildable":
      factor -= 0.16;
      modifiers.push({ label: "Nicht bebaubar", factor: -0.16 });
      break;
    default:
      break;
  }

  if (facts.bebauungsgebiet === "wohn") {
    factor += 0.03;
    modifiers.push({ label: "Wohngebiet", factor: 0.03 });
  }
  if (facts.bebauungsgebiet === "misch") {
    factor += 0.01;
    modifiers.push({ label: "Mischgebiet", factor: 0.01 });
  }
  if (facts.bebauungsgebiet === "gewerbe") {
    factor -= 0.03;
    modifiers.push({ label: "Gewerbegebiet", factor: -0.03 });
  }

  return { factor, modifiers };
}

function getRangeFactor(payload: LeadSyncPayload, marketScope: LeadValuationResult["marketScope"], marketRecord: MarketRecord | null) {
  let factor = 0.1;

  if (marketScope === "stadt_gemeinde" || marketScope === "plz") factor = 0.12;
  if (!marketRecord) factor = 0.15;
  if (payload.propertyType === "land") factor += 0.02;

  const unknownCount = [
    !payload.facts?.yearBuilt,
    !payload.facts?.condition || payload.facts.condition === "unknown",
    !payload.facts?.qualityId || payload.facts.qualityId === "unknown",
    !payload.facts?.energyClass,
  ].filter(Boolean).length;

  factor += unknownCount * 0.005;
  return clamp(factor, 0.1, 0.15);
}

export async function calculateLeadValuation(input: {
  payload: LeadSyncPayload;
  marketRecord: MarketRecord | null;
  marketScope: LeadValuationResult["marketScope"];
}) : Promise<LeadValuationResult> {
  const { payload, marketRecord, marketScope } = input;
  const postalCode = String(payload.location?.postalCode ?? "").trim();
  const plzMedians = await getPlzMedianRates(postalCode);
  const base = getBaseRate(payload, marketRecord, plzMedians);

  const area = getResidentialArea(payload);
  if (!area || area <= 0) {
    throw new Error("Für die Bewertung fehlt eine belastbare Fläche.");
  }

  const modifiers: LeadValuationBreakdown["modifiers"] = [];
  let factor = 1;

  if (payload.propertyType === "house") {
    const houseTypeFactor = getHouseTypeFactor(payload);
    if (houseTypeFactor !== 1) modifiers.push({ label: "Haustyp", factor: houseTypeFactor - 1 });
    factor *= houseTypeFactor;
  }

  const yearFactor = getYearFactor(payload.facts?.yearBuilt);
  if (yearFactor !== 1) modifiers.push({ label: "Baujahr", factor: yearFactor - 1 });
  factor *= yearFactor;

  const conditionFactor = getConditionFactor(payload.facts?.condition);
  if (conditionFactor !== 1) modifiers.push({ label: "Zustand", factor: conditionFactor - 1 });
  factor *= conditionFactor;

  const qualityFactor = getQualityFactor(payload.facts?.qualityId);
  if (qualityFactor !== 1) modifiers.push({ label: "Ausstattung", factor: qualityFactor - 1 });
  factor *= qualityFactor;

  const energyFactor = getEnergyFactor(payload.facts?.energyClass);
  if (energyFactor !== 1) modifiers.push({ label: "Energieklasse", factor: energyFactor - 1 });
  factor *= energyFactor;

  const usageFactor = getUsageFactor(payload.facts?.usage);
  if (usageFactor !== 1) modifiers.push({ label: "Nutzung", factor: usageFactor - 1 });
  factor *= usageFactor;

  const reasonFactor = getReasonFactor(payload.facts?.reason);
  if (reasonFactor !== 1) modifiers.push({ label: "Anlass", factor: reasonFactor - 1 });
  factor *= reasonFactor;

  const extras = getExtrasAdjustment(payload);
  factor *= extras.factor;
  modifiers.push(...extras.modifiers);

  if (payload.propertyType === "land") {
    const land = getLandSpecificFactor(payload);
    factor *= land.factor;
    modifiers.push(...land.modifiers);
  }

  factor = clamp(factor, 0.78, 1.25);

  const midRaw = base.rate * area * factor + extras.euroBonus;
  const rangeFactor = getRangeFactor(payload, marketScope, marketRecord);
  const valueMid = roundTo(midRaw, 1000);
  const valueMin = roundTo(valueMid * (1 - rangeFactor), 5000, "floor");
  const valueMax = roundTo(valueMid * (1 + rangeFactor), 5000, "ceil");

  return {
    marketRecord,
    marketScope,
    valueMid,
    valueMin,
    valueMax,
    displayMid: euro(valueMid),
    displayRange: `${euro(valueMin)} – ${euro(valueMax)}`,
    breakdown: {
      baseRatePerSqm: base.rate,
      baseSource: base.source,
      appliedFactor: Number(factor.toFixed(4)),
      extrasEuro: extras.euroBonus,
      rangeFactor,
      modifiers,
    },
  };
}
