import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

export type MarketRecord = {
  region_code: string | null;
  landkreis: string | null;
  stadt_gemeinde: string | null;
  ortsteil: string | null;
  datensatz_typ: "stadt_gemeinde" | "ortsteil" | string | null;
  location_id: string | null;
  parent_location_id: string | null;
  location_label: string | null;
  parent_label: string | null;
  location_join_key: string | null;
  parent_join_key: string | null;
  location_slug: string | null;
  plz: string | null;
  plz_bereiche: string | null;
  plz_quelle: string | null;
  plz_match_level: string | null;
  leadgen_geeignet: boolean;
  leadgen_scope: string | null;
  landingpage_geeignet: boolean;
  landingpage_scope: string | null;
  verkaeufe_anzahl: number | null;
  min_preis_eur_m2: number | null;
  quantil_01_preis_eur_m2: number | null;
  median_preis_eur_m2: number | null;
  durchschnitt_preis_eur_m2: number | null;
  quantil_09_preis_eur_m2: number | null;
  max_preis_eur_m2: number | null;
  delta_vorjahr_median_prozent: number | null;
  efh_median_preis_eur: number | null;
  tage_am_markt: number | null;
  tage_am_markt_vorjahr: number | null;
  median_2016: number | null;
  median_2017: number | null;
  median_2018: number | null;
  median_2019: number | null;
  median_2020: number | null;
  median_2021: number | null;
  median_2022: number | null;
  median_2023: number | null;
  median_2024: number | null;
  median_2025: number | null;
  postal_codes?: string[];
  [key: string]: unknown;
};

type MarketRuntimePayload = {
  generatedAt: string;
  sourceFile: string;
  recordCount: number;
  records: MarketRecord[];
};

export type MarketLocationMatch = {
  record: MarketRecord | null;
  scope: "ortsteil" | "stadt_gemeinde" | "plz" | "none";
};

let runtimePromise: Promise<MarketRuntimePayload> | null = null;

function normalizeSlug(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizePostalCode(value: unknown) {
  const normalized = String(value ?? "").trim();
  return /^\d{5}$/.test(normalized) ? normalized : "";
}

function includesPostalCode(record: MarketRecord, postalCode: string) {
  if (!postalCode) return false;
  if (record.plz === postalCode) return true;
  return Array.isArray(record.postal_codes) ? record.postal_codes.includes(postalCode) : false;
}

function getRuntimePath() {
  return path.resolve(process.cwd(), "..", "data", "market", "runtime", "leadgen_market_data.json");
}

async function loadRuntimeData() {
  const raw = await readFile(getRuntimePath(), "utf-8");
  return JSON.parse(raw) as MarketRuntimePayload;
}

export async function getMarketRuntimeData() {
  if (!runtimePromise) {
    runtimePromise = loadRuntimeData().catch((error) => {
      runtimePromise = null;
      throw error;
    });
  }

  return runtimePromise;
}

export async function findBestMarketRecord(input: {
  postalCode?: string | null;
  city?: string | null;
  district?: string | null;
}) : Promise<MarketLocationMatch> {
  const data = await getMarketRuntimeData();
  const postalCode = normalizePostalCode(input.postalCode);
  const city = normalizeSlug(input.city);
  const district = normalizeSlug(input.district);

  if (!postalCode && !city) {
    return { record: null, scope: "none" };
  }

  const records = data.records.filter((item) => item.leadgen_geeignet !== false);

  if (district) {
    const ortsteilExact = records.find((item) => {
      if (item.datensatz_typ !== "ortsteil") return false;
      return (
        normalizeSlug(item.stadt_gemeinde) === city &&
        normalizeSlug(item.ortsteil) === district &&
        (!postalCode || includesPostalCode(item, postalCode))
      );
    });

    if (ortsteilExact) return { record: ortsteilExact, scope: "ortsteil" };
  }

  if (city) {
    const cityExact = records.find((item) => {
      if (item.datensatz_typ !== "stadt_gemeinde") return false;
      return normalizeSlug(item.stadt_gemeinde) === city && (!postalCode || includesPostalCode(item, postalCode));
    });

    if (cityExact) return { record: cityExact, scope: "stadt_gemeinde" };
  }

  if (postalCode) {
    const postalFallback =
      records.find((item) => item.datensatz_typ === "ortsteil" && item.plz === postalCode) ??
      records.find((item) => item.datensatz_typ === "stadt_gemeinde" && includesPostalCode(item, postalCode)) ??
      null;

    if (postalFallback) return { record: postalFallback, scope: "plz" };
  }

  return { record: null, scope: "none" };
}
