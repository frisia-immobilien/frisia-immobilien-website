import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

export type ImportError = {
  file: string;
  row: number;
  reason: string;
  raw?: Record<string, unknown>;
};

type ParsedRow = Record<string, string | number | null>;

export type MarketImportRecord = {
  object_type: "haus" | "wohnung";
  region_code: string | null;
  landkreis: string | null;
  stadt_gemeinde: string | null;
  ortsteil: string | null;
  datensatz_typ: string;
  location_id: string | null;
  parent_location_id: string | null;
  location_label: string | null;
  parent_label: string | null;
  location_join_key: string;
  parent_join_key: string | null;
  region_slug: string | null;
  landkreis_slug: string | null;
  stadt_gemeinde_slug: string | null;
  ortsteil_slug: string | null;
  location_slug: string | null;
  objektart: string | null;
  plz: string | null;
  plz_bereiche: string | null;
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
  median_preis_eur: number | null;
  tage_am_markt: number | null;
  price_history: Array<{
    object_type: "haus" | "wohnung";
    location_slug: string;
    year: number;
    median_preis_eur_m2: number;
    durchschnitt_preis_eur_m2: number | null;
    verkaeufe_anzahl: number | null;
    data_quality: string;
  }>;
};

export function loadLocalEnv(repoRoot: string) {
  const envPath = path.join(repoRoot, "web", ".env.local");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^"|"$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

export function repoRootFromScript() {
  return path.resolve(import.meta.dirname, "..");
}

export function getImportDir(repoRoot: string) {
  return path.resolve(process.env.MARKET_DATA_IMPORT_DIR || path.join(repoRoot, "data", "market", "import"));
}

export function getImportFiles(importDir: string) {
  if (!existsSync(importDir)) mkdirSync(importDir, { recursive: true });
  return readdirSync(importDir)
    .filter((file) => file.toLowerCase().endsWith(".xlsx") && !file.startsWith("~$"))
    .map((file) => path.join(importDir, file))
    .sort();
}

function xmlUnescape(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function getAttr(source: string, name: string) {
  const match = source.match(new RegExp(`${name}="([^"]*)"`));
  return match ? xmlUnescape(match[1]) : "";
}

function columnIndex(ref: string) {
  const letters = ref.replace(/[0-9]/g, "");
  let index = 0;
  for (const letter of letters) {
    index = index * 26 + (letter.charCodeAt(0) - 64);
  }
  return index - 1;
}

function cellValue(attrs: string, body: string, sharedStrings: string[]) {
  const type = getAttr(attrs, "t");
  if (type === "inlineStr") {
    const texts = Array.from(body.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)).map((match) => xmlUnescape(match[1]));
    return texts.join("");
  }

  const value = body.match(/<v>([\s\S]*?)<\/v>/)?.[1];
  if (value === undefined) return null;
  const unescaped = xmlUnescape(value);

  if (type === "s") {
    return sharedStrings[Number(unescaped)] ?? null;
  }

  const numeric = Number(unescaped);
  return Number.isFinite(numeric) ? numeric : unescaped;
}

function readZipEntry(file: string, entry: string) {
  try {
    return execFileSync("unzip", ["-p", file, entry], {
      encoding: "utf-8",
      maxBuffer: 50 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
}

function readSharedStrings(file: string) {
  const xml = readZipEntry(file, "xl/sharedStrings.xml");
  if (!xml) return [];
  return Array.from(xml.matchAll(/<si>([\s\S]*?)<\/si>/g)).map((match) => {
    return Array.from(match[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g))
      .map((text) => xmlUnescape(text[1]))
      .join("");
  });
}

export function readXlsxRows(file: string): ParsedRow[] {
  const sharedStrings = readSharedStrings(file);
  const sheetXml = readZipEntry(file, "xl/worksheets/sheet1.xml");
  if (!sheetXml) throw new Error(`Keine sheet1.xml in ${file} gefunden.`);

  const rows: Array<Array<string | number | null>> = [];
  for (const rowMatch of sheetXml.matchAll(/<row\b[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    const rowIndex = Number(rowMatch[1]) - 1;
    const rowValues: Array<string | number | null> = [];
    for (const cellMatch of rowMatch[2].matchAll(/<c\b([^>]*?)(?:\s*\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = cellMatch[1] ?? "";
      const ref = getAttr(attrs, "r");
      if (!ref) continue;
      rowValues[columnIndex(ref)] = cellValue(attrs, cellMatch[2] ?? "", sharedStrings);
    }
    rows[rowIndex] = rowValues;
  }

  const headers = (rows[0] ?? []).map((value) => normalizeHeader(String(value ?? "")));
  return rows.slice(1).map((row) => {
    const record: ParsedRow = {};
    headers.forEach((header, index) => {
      if (!header) return;
      record[header] = row?.[index] ?? null;
    });
    return record;
  });
}

function normalizeHeader(value: string) {
  return value
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

function text(row: ParsedRow, key: string) {
  const value = row[key];
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

function number(row: ParsedRow, key: string) {
  const value = row[key];
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function bool(row: ParsedRow, key: string) {
  const normalized = String(row[key] ?? "").trim().toLowerCase();
  return ["ja", "true", "1", "yes"].includes(normalized);
}

function detectObjectType(file: string, row: ParsedRow): "haus" | "wohnung" | null {
  const source = `${path.basename(file)} ${text(row, "objektart") ?? ""}`.toLowerCase();
  if (source.includes("wohnung")) return "wohnung";
  if (source.includes("haus") || source.includes("häuser") || source.includes("haeuser")) return "haus";
  return null;
}

function publicLocationSlug(row: ParsedRow) {
  return text(row, "ortsteil_slug") ?? text(row, "stadt_gemeinde_slug") ?? text(row, "landkreis_slug") ?? text(row, "region_slug");
}

export function mapMarketRow(file: string, row: ParsedRow, rowNumber: number): { record?: MarketImportRecord; error?: ImportError } {
  const objectType = detectObjectType(file, row);
  const locationJoinKey = text(row, "location_join_key");
  const datensatzTyp = text(row, "datensatz_typ");
  const medianM2 = number(row, "median_preis_eur_m2");
  const locationSlug = publicLocationSlug(row);
  const hasMedian = medianM2 !== null;

  const missing = [
    !objectType ? "object_type" : null,
    !locationJoinKey ? "location_join_key" : null,
    !datensatzTyp ? "datensatz_typ" : null,
    text(row, "leadgen_geeignet") === null ? "leadgen_geeignet" : null,
    text(row, "landingpage_geeignet") === null ? "landingpage_geeignet" : null,
  ].filter(Boolean);

  if (missing.length > 0 || !objectType || !locationJoinKey || !datensatzTyp) {
    return {
      error: {
        file,
        row: rowNumber,
        reason: `Pflichtfelder fehlen: ${missing.join(", ")}`,
        raw: row,
      },
    };
  }

  const history = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
    .map((year) => {
      const value = number(row, `median_${year}`);
      if (!value || !locationSlug) return null;
      return {
        object_type: objectType,
        location_slug: locationSlug,
        year,
        median_preis_eur_m2: value,
        durchschnitt_preis_eur_m2: null,
        verkaeufe_anzahl: number(row, "verkaeufe_anzahl"),
        data_quality: "excel_import",
      };
    })
    .filter(Boolean) as MarketImportRecord["price_history"];

  return {
    record: {
      object_type: objectType,
      region_code: text(row, "region_code"),
      landkreis: text(row, "landkreis"),
      stadt_gemeinde: text(row, "stadt_gemeinde"),
      ortsteil: text(row, "ortsteil"),
      datensatz_typ: datensatzTyp,
      location_id: text(row, "location_id"),
      parent_location_id: text(row, "parent_location_id"),
      location_label: text(row, "location_label"),
      parent_label: text(row, "parent_label"),
      location_join_key: locationJoinKey,
      parent_join_key: text(row, "parent_join_key"),
      region_slug: text(row, "region_slug"),
      landkreis_slug: text(row, "landkreis_slug"),
      stadt_gemeinde_slug: text(row, "stadt_gemeinde_slug"),
      ortsteil_slug: text(row, "ortsteil_slug"),
      location_slug: text(row, "location_slug"),
      objektart: text(row, "objektart"),
      plz: text(row, "plz"),
      plz_bereiche: text(row, "plz_bereiche"),
      leadgen_geeignet: bool(row, "leadgen_geeignet") && hasMedian,
      leadgen_scope: text(row, "leadgen_scope"),
      landingpage_geeignet: bool(row, "landingpage_geeignet"),
      landingpage_scope: text(row, "landingpage_scope"),
      verkaeufe_anzahl: number(row, "verkaeufe_anzahl"),
      min_preis_eur_m2: number(row, "min_preis_eur_m2"),
      quantil_01_preis_eur_m2: number(row, "quantil_01_preis_eur_m2"),
      median_preis_eur_m2: medianM2,
      durchschnitt_preis_eur_m2: number(row, "durchschnitt_preis_eur_m2"),
      quantil_09_preis_eur_m2: number(row, "quantil_09_preis_eur_m2"),
      max_preis_eur_m2: number(row, "max_preis_eur_m2"),
      delta_vorjahr_median_prozent: number(row, "delta_vorjahr_median_prozent"),
      median_preis_eur:
        number(row, "median_preis_eur") ?? number(row, "efh_median_preis_eur") ?? number(row, "wohnung_median_preis_eur"),
      tage_am_markt: number(row, "tage_am_markt"),
      price_history: history,
    },
  };
}

export function collectMarketRecords(files: string[]) {
  const errors: ImportError[] = [];
  const map = new Map<string, MarketImportRecord>();

  for (const file of files) {
    const rows = readXlsxRows(file);
    rows.forEach((row, index) => {
      const result = mapMarketRow(file, row, index + 2);
      if (result.error) {
        errors.push(result.error);
        return;
      }
      if (!result.record) return;
      map.set(`${result.record.object_type}|${result.record.location_join_key}|${result.record.datensatz_typ}`, result.record);
    });
  }

  return { records: Array.from(map.values()), errors };
}

export function writeImportErrors(repoRoot: string, errors: ImportError[]) {
  const target = path.join(repoRoot, "data", "market", "import_errors.json");
  writeFileSync(target, JSON.stringify({ generatedAt: new Date().toISOString(), errors }, null, 2));
  return target;
}

export function getSql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL fehlt.");
  return neon(process.env.DATABASE_URL);
}

export async function upsertMarketRecords(sql: ReturnType<typeof neon>, records: MarketImportRecord[]) {
  if (records.length === 0) return;
  await sql`
    WITH input AS (
      SELECT *
      FROM jsonb_to_recordset(${JSON.stringify(records)}::jsonb) AS x(
        object_type text,
        region_code text,
        landkreis text,
        stadt_gemeinde text,
        ortsteil text,
        datensatz_typ text,
        location_id text,
        parent_location_id text,
        location_label text,
        parent_label text,
        location_join_key text,
        parent_join_key text,
        region_slug text,
        landkreis_slug text,
        stadt_gemeinde_slug text,
        ortsteil_slug text,
        location_slug text,
        objektart text,
        plz text,
        plz_bereiche text,
        leadgen_geeignet boolean,
        leadgen_scope text,
        landingpage_geeignet boolean,
        landingpage_scope text,
        verkaeufe_anzahl integer,
        min_preis_eur_m2 numeric,
        quantil_01_preis_eur_m2 numeric,
        median_preis_eur_m2 numeric,
        durchschnitt_preis_eur_m2 numeric,
        quantil_09_preis_eur_m2 numeric,
        max_preis_eur_m2 numeric,
        delta_vorjahr_median_prozent numeric,
        median_preis_eur numeric,
        tage_am_markt integer
      )
    )
    INSERT INTO market_data (
      object_type,
      region_code,
      landkreis,
      stadt_gemeinde,
      ortsteil,
      datensatz_typ,
      location_id,
      parent_location_id,
      location_label,
      parent_label,
      location_join_key,
      parent_join_key,
      region_slug,
      landkreis_slug,
      stadt_gemeinde_slug,
      ortsteil_slug,
      location_slug,
      objektart,
      plz,
      plz_bereiche,
      leadgen_geeignet,
      leadgen_scope,
      landingpage_geeignet,
      landingpage_scope,
      verkaeufe_anzahl,
      min_preis_eur_m2,
      quantil_01_preis_eur_m2,
      median_preis_eur_m2,
      durchschnitt_preis_eur_m2,
      quantil_09_preis_eur_m2,
      max_preis_eur_m2,
      delta_vorjahr_median_prozent,
      median_preis_eur,
      tage_am_markt
    )
    SELECT
      object_type,
      region_code,
      landkreis,
      stadt_gemeinde,
      ortsteil,
      datensatz_typ,
      location_id,
      parent_location_id,
      location_label,
      parent_label,
      location_join_key,
      parent_join_key,
      region_slug,
      landkreis_slug,
      stadt_gemeinde_slug,
      ortsteil_slug,
      location_slug,
      objektart,
      plz,
      plz_bereiche,
      leadgen_geeignet,
      leadgen_scope,
      landingpage_geeignet,
      landingpage_scope,
      verkaeufe_anzahl,
      min_preis_eur_m2,
      quantil_01_preis_eur_m2,
      median_preis_eur_m2,
      durchschnitt_preis_eur_m2,
      quantil_09_preis_eur_m2,
      max_preis_eur_m2,
      delta_vorjahr_median_prozent,
      median_preis_eur,
      tage_am_markt
    FROM input
    ON CONFLICT (object_type, location_join_key, datensatz_typ)
    DO UPDATE SET
      region_code = EXCLUDED.region_code,
      landkreis = EXCLUDED.landkreis,
      stadt_gemeinde = EXCLUDED.stadt_gemeinde,
      ortsteil = EXCLUDED.ortsteil,
      location_id = EXCLUDED.location_id,
      parent_location_id = EXCLUDED.parent_location_id,
      location_label = EXCLUDED.location_label,
      parent_label = EXCLUDED.parent_label,
      parent_join_key = EXCLUDED.parent_join_key,
      region_slug = EXCLUDED.region_slug,
      landkreis_slug = EXCLUDED.landkreis_slug,
      stadt_gemeinde_slug = EXCLUDED.stadt_gemeinde_slug,
      ortsteil_slug = EXCLUDED.ortsteil_slug,
      location_slug = EXCLUDED.location_slug,
      objektart = EXCLUDED.objektart,
      plz = EXCLUDED.plz,
      plz_bereiche = EXCLUDED.plz_bereiche,
      leadgen_geeignet = EXCLUDED.leadgen_geeignet,
      leadgen_scope = EXCLUDED.leadgen_scope,
      landingpage_geeignet = EXCLUDED.landingpage_geeignet,
      landingpage_scope = EXCLUDED.landingpage_scope,
      verkaeufe_anzahl = EXCLUDED.verkaeufe_anzahl,
      min_preis_eur_m2 = EXCLUDED.min_preis_eur_m2,
      quantil_01_preis_eur_m2 = EXCLUDED.quantil_01_preis_eur_m2,
      median_preis_eur_m2 = EXCLUDED.median_preis_eur_m2,
      durchschnitt_preis_eur_m2 = EXCLUDED.durchschnitt_preis_eur_m2,
      quantil_09_preis_eur_m2 = EXCLUDED.quantil_09_preis_eur_m2,
      max_preis_eur_m2 = EXCLUDED.max_preis_eur_m2,
      delta_vorjahr_median_prozent = EXCLUDED.delta_vorjahr_median_prozent,
      median_preis_eur = EXCLUDED.median_preis_eur,
      tage_am_markt = EXCLUDED.tage_am_markt
  `;
}

export async function upsertPriceHistory(sql: ReturnType<typeof neon>, records: MarketImportRecord[]) {
  const historyByKey = new Map<string, MarketImportRecord["price_history"][number]>();
  for (const entry of records.flatMap((record) => record.price_history)) {
    historyByKey.set(`${entry.object_type}|${entry.location_slug}|${entry.year}`, entry);
  }
  const history = Array.from(historyByKey.values());
  if (history.length === 0) return;

  await sql`
    WITH input AS (
      SELECT *
      FROM jsonb_to_recordset(${JSON.stringify(history)}::jsonb) AS x(
        object_type text,
        location_slug text,
        year integer,
        median_preis_eur_m2 numeric,
        durchschnitt_preis_eur_m2 numeric,
        verkaeufe_anzahl integer,
        data_quality text
      )
    )
    INSERT INTO price_history (
      object_type,
      location_slug,
      year,
      median_preis_eur_m2,
      durchschnitt_preis_eur_m2,
      verkaeufe_anzahl,
      data_quality
    )
    SELECT object_type, location_slug, year, median_preis_eur_m2, durchschnitt_preis_eur_m2, verkaeufe_anzahl, data_quality
    FROM input
    ON CONFLICT (object_type, location_slug, year)
    DO UPDATE SET
      median_preis_eur_m2 = EXCLUDED.median_preis_eur_m2,
      durchschnitt_preis_eur_m2 = EXCLUDED.durchschnitt_preis_eur_m2,
      verkaeufe_anzahl = EXCLUDED.verkaeufe_anzahl,
      data_quality = EXCLUDED.data_quality
  `;
}

export async function generateSeoLocations(sql: ReturnType<typeof neon>) {
  await sql`
    WITH source AS (
      SELECT
        COALESCE(NULLIF(ortsteil_slug, ''), NULLIF(stadt_gemeinde_slug, ''), NULLIF(landkreis_slug, ''), NULLIF(region_slug, '')) AS public_slug,
        COALESCE(NULLIF(location_label, ''), NULLIF(ortsteil, ''), NULLIF(stadt_gemeinde, ''), NULLIF(landkreis, ''), 'Ostfriesland') AS location_label,
        CASE
          WHEN datensatz_typ = 'ortsteil' THEN 'ortsteil'
          WHEN datensatz_typ = 'landkreis' THEN 'landkreis'
          WHEN datensatz_typ = 'region' THEN 'region'
          ELSE 'stadt_gemeinde'
        END AS location_type,
        stadt_gemeinde,
        ortsteil,
        landkreis,
        COALESCE(region_code, 'Ostfriesland') AS region,
        plz,
        CASE
          WHEN datensatz_typ = 'ortsteil' THEN stadt_gemeinde_slug
          WHEN datensatz_typ = 'stadt_gemeinde' THEN landkreis_slug
          WHEN datensatz_typ = 'landkreis' THEN region_slug
          ELSE NULL
        END AS parent_location_slug,
        BOOL_OR(landingpage_geeignet) AS landingpage_geeignet,
        BOOL_OR(leadgen_geeignet) AS leadgen_geeignet,
        MAX(COALESCE(verkaeufe_anzahl, 0)) AS sales_count,
        MAX(CASE WHEN stadt_gemeinde_slug IN ('aurich', 'emden', 'leer', 'wittmund', 'norden', 'esens', 'wiesmoor', 'suedbrookmerland', 'grossheide') THEN 100 ELSE 50 END) AS priority
      FROM market_data
      WHERE COALESCE(NULLIF(ortsteil_slug, ''), NULLIF(stadt_gemeinde_slug, ''), NULLIF(landkreis_slug, ''), NULLIF(region_slug, '')) IS NOT NULL
      GROUP BY
        public_slug,
        location_label,
        location_type,
        stadt_gemeinde,
        ortsteil,
        landkreis,
        region,
        plz,
        parent_location_slug
    ),
    ranked AS (
      SELECT DISTINCT ON (public_slug)
        public_slug,
        location_label,
        location_type,
        stadt_gemeinde,
        ortsteil,
        landkreis,
        region,
        plz,
        parent_location_slug,
        landingpage_geeignet,
        leadgen_geeignet,
        priority,
        (landingpage_geeignet AND (sales_count >= 10 OR priority >= 90 OR location_type <> 'ortsteil')) AS indexable
      FROM source
      ORDER BY public_slug, priority DESC, sales_count DESC
    )
    INSERT INTO seo_locations (
      location_slug,
      location_label,
      location_type,
      stadt_gemeinde,
      ortsteil,
      landkreis,
      region,
      plz,
      parent_location_slug,
      landingpage_geeignet,
      leadgen_geeignet,
      priority,
      indexable
    )
    SELECT
      public_slug,
      location_label,
      location_type,
      stadt_gemeinde,
      ortsteil,
      landkreis,
      region,
      plz,
      parent_location_slug,
      landingpage_geeignet,
      leadgen_geeignet,
      priority,
      indexable
    FROM ranked
    ON CONFLICT (location_slug)
    DO UPDATE SET
      location_label = EXCLUDED.location_label,
      location_type = EXCLUDED.location_type,
      stadt_gemeinde = EXCLUDED.stadt_gemeinde,
      ortsteil = EXCLUDED.ortsteil,
      landkreis = EXCLUDED.landkreis,
      region = EXCLUDED.region,
      plz = EXCLUDED.plz,
      parent_location_slug = EXCLUDED.parent_location_slug,
      landingpage_geeignet = EXCLUDED.landingpage_geeignet,
      leadgen_geeignet = EXCLUDED.leadgen_geeignet,
      priority = EXCLUDED.priority,
      indexable = EXCLUDED.indexable
  `;
}
