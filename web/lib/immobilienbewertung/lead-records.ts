import "server-only";

import crypto from "node:crypto";

import { sql } from "@/lib/db";
import { hashToken } from "@/lib/tokens";
import type { LeadProgressRecord } from "@/lib/lead-progress";
import type { LeadSyncPayload } from "@/lib/lead-sync";
import type { LeadValuationResult } from "@/lib/immobilienbewertung/valuation";

export type LeadValuationRow = {
  id: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  lead_progress_id: string | null;
  fingerprint: string | null;
  token_hash: string;
  type: "house" | "apartment" | "land";
  house_type: string | null;
  plz: string;
  city: string | null;
  district: string | null;
  street: string | null;
  house_number: string | null;
  location_text: string | null;
  living_area: number | null;
  land_area: number | null;
  rooms: number | null;
  year_built: number | null;
  energy_class: string | null;
  condition: string | null;
  quality: string | null;
  extras: string | null;
  other_extras: string | null;
  other_extras_value_eur: number | null;
  reason: string | null;
  usage: string | null;
  email: string;
  salutation: string | null;
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  phone: string | null;
  consent: boolean;
  privacy_accepted_at: string | null;
  market_location_id: string | null;
  market_location_label: string | null;
  market_scope: string | null;
  market_plz_bereiche: string | null;
  market_median_preis_eur_m2: number | null;
  market_verkaeufe_anzahl: number | null;
  market_tage_am_markt: number | null;
  market_delta_vorjahr_median_prozent: number | null;
  value_min: number;
  value_mid: number;
  value_max: number;
  valuation_payload: string | null;
  valuation_breakdown: string | null;
  email_sent_at: string | null;
  email_provider: string | null;
  email_message_id: string | null;
  opened_at: string | null;
  open_count: number;
  last_opened_at: string | null;
  cta_clicked_at: string | null;
  cta_click_count: number;
  callback_requested_at: string | null;
};

type UpsertLeadValuationInput = {
  leadProgress: LeadProgressRecord;
  payload: LeadSyncPayload;
  valuation: LeadValuationResult;
  tokenHash: string;
  expiresAt: Date;
};

type TrackLeadEventInput = {
  leadId: string;
  eventType: "landing_view" | "cta_precise_valuation_click" | "callback_requested";
  userAgent?: string | null;
  referer?: string | null;
  ip?: string | null;
};

function normalizeText(value: unknown) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function buildLocationText(payload: LeadSyncPayload) {
  return [
    [payload.location?.street, payload.location?.houseNumber].filter(Boolean).join(" "),
    [payload.location?.postalCode, payload.location?.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
}

function hashIp(value: string | null | undefined) {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  return crypto
    .createHash("sha256")
    .update(`${normalized}.${process.env.TOKEN_SECRET || "lead"}`)
    .digest("hex");
}

function requireTokenSecret() {
  if (!process.env.TOKEN_SECRET) {
    throw new Error("TOKEN_SECRET fehlt.");
  }

  return process.env.TOKEN_SECRET;
}

export async function ensureLeadValuationTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      lead_progress_id UUID UNIQUE,
      fingerprint TEXT,
      token_hash TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      house_type TEXT,
      plz TEXT NOT NULL,
      city TEXT,
      district TEXT,
      street TEXT,
      house_number TEXT,
      location_text TEXT,
      living_area NUMERIC(12,2),
      land_area NUMERIC(12,2),
      rooms NUMERIC(8,2),
      year_built INT,
      energy_class TEXT,
      condition TEXT,
      quality TEXT,
      extras TEXT,
      other_extras TEXT,
      other_extras_value_eur NUMERIC(12,2),
      reason TEXT,
      usage TEXT,
      email TEXT NOT NULL,
      salutation TEXT,
      first_name TEXT,
      last_name TEXT,
      name TEXT,
      phone TEXT,
      consent BOOLEAN NOT NULL DEFAULT FALSE,
      privacy_accepted_at TIMESTAMPTZ,
      market_location_id TEXT,
      market_location_label TEXT,
      market_scope TEXT,
      market_plz_bereiche TEXT,
      market_median_preis_eur_m2 NUMERIC(12,2),
      market_verkaeufe_anzahl INT,
      market_tage_am_markt INT,
      market_delta_vorjahr_median_prozent NUMERIC(12,2),
      value_min INT NOT NULL,
      value_mid INT NOT NULL,
      value_max INT NOT NULL,
      valuation_payload TEXT,
      valuation_breakdown TEXT,
      email_sent_at TIMESTAMPTZ,
      email_provider TEXT,
      email_message_id TEXT,
      opened_at TIMESTAMPTZ,
      open_count INT NOT NULL DEFAULT 0,
      last_opened_at TIMESTAMPTZ,
      cta_clicked_at TIMESTAMPTZ,
      cta_click_count INT NOT NULL DEFAULT 0,
      callback_requested_at TIMESTAMPTZ
    );
  `;

  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_progress_id UUID;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS fingerprint TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS city TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS district TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS street TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS house_number TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS location_text TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS rooms NUMERIC(8,2);`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS year_built INT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS energy_class TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS condition TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS quality TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS extras TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS other_extras TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS other_extras_value_eur NUMERIC(12,2);`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS reason TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS usage TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS salutation TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_name TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_name TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent BOOLEAN NOT NULL DEFAULT FALSE;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS market_location_id TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS market_location_label TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS market_scope TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS market_plz_bereiche TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS market_median_preis_eur_m2 NUMERIC(12,2);`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS market_verkaeufe_anzahl INT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS market_tage_am_markt INT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS market_delta_vorjahr_median_prozent NUMERIC(12,2);`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS valuation_payload TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS valuation_breakdown TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_provider TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_message_id TEXT;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS open_count INT NOT NULL DEFAULT 0;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMPTZ;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS cta_clicked_at TIMESTAMPTZ;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS cta_click_count INT NOT NULL DEFAULT 0;`;

  await sql`
    CREATE TABLE IF NOT EXISTS lead_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID NOT NULL,
      event_type TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      user_agent TEXT,
      referer TEXT,
      ip_hash TEXT
    );
  `;

  await sql`CREATE UNIQUE INDEX IF NOT EXISTS leads_progress_idx ON leads(lead_progress_id);`;
  await sql`CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);`;
  await sql`CREATE INDEX IF NOT EXISTS leads_token_hash_idx ON leads(token_hash);`;
  await sql`CREATE INDEX IF NOT EXISTS lead_events_lead_idx ON lead_events(lead_id);`;
}

export async function upsertLeadValuationRecord(input: UpsertLeadValuationInput) {
  await ensureLeadValuationTables();

  const existingRows = (await sql`
    SELECT *
    FROM leads
    WHERE lead_progress_id = ${input.leadProgress.id}
    LIMIT 1
  `) as LeadValuationRow[];

  const existing = existingRows[0] ?? null;
  const payload = input.payload;
  const person = payload.person;
  const marketRecord = input.valuation.marketRecord;
  const locationText = buildLocationText(payload);
  const name = [normalizeText(person?.firstName), normalizeText(person?.lastName)].filter(Boolean).join(" ") || null;
  const valuationPayload = JSON.stringify(payload);
  const valuationBreakdown = JSON.stringify({
    scope: input.valuation.marketScope,
    marketRecord,
    breakdown: input.valuation.breakdown,
  });

  if (!existing) {
    const rows = (await sql`
      INSERT INTO leads (
        expires_at,
        lead_progress_id,
        fingerprint,
        token_hash,
        type,
        house_type,
        plz,
        city,
        district,
        street,
        house_number,
        location_text,
        living_area,
        land_area,
        rooms,
        year_built,
        energy_class,
        condition,
        quality,
        extras,
        other_extras,
        other_extras_value_eur,
        reason,
        usage,
        email,
        salutation,
        first_name,
        last_name,
        name,
        phone,
        consent,
        privacy_accepted_at,
        market_location_id,
        market_location_label,
        market_scope,
        market_plz_bereiche,
        market_median_preis_eur_m2,
        market_verkaeufe_anzahl,
        market_tage_am_markt,
        market_delta_vorjahr_median_prozent,
        value_min,
        value_mid,
        value_max,
        valuation_payload,
        valuation_breakdown
      )
      VALUES (
        ${input.expiresAt},
        ${input.leadProgress.id},
        ${input.leadProgress.fingerprint},
        ${input.tokenHash},
        ${payload.propertyType},
        ${normalizeText(payload.houseType)},
        ${normalizeText(payload.location?.postalCode)},
        ${normalizeText(payload.location?.city)},
        ${normalizeText(payload.location?.district)},
        ${normalizeText(payload.location?.street)},
        ${normalizeText(payload.location?.houseNumber)},
        ${locationText},
        ${normalizeNumber(payload.facts?.livingArea)},
        ${normalizeNumber(payload.facts?.landSize)},
        ${normalizeNumber(payload.facts?.rooms)},
        ${normalizeNumber(payload.facts?.yearBuilt)},
        ${normalizeText(payload.facts?.energyClass)},
        ${normalizeText(payload.facts?.condition)},
        ${normalizeText(payload.facts?.qualityId)},
        ${Array.isArray(payload.facts?.extras) ? JSON.stringify(payload.facts.extras) : null},
        ${normalizeText(payload.facts?.otherExtras)},
        ${normalizeNumber(payload.facts?.otherExtrasValueEur)},
        ${normalizeText(payload.facts?.reason)},
        ${normalizeText(payload.facts?.usage)},
        ${normalizeText(payload.email)},
        ${normalizeText(person?.salutation)},
        ${normalizeText(person?.firstName)},
        ${normalizeText(person?.lastName)},
        ${name},
        ${normalizeText(person?.phone)},
        ${payload.consent === true},
        NOW(),
        ${normalizeText(marketRecord?.location_id)},
        ${normalizeText(marketRecord?.location_label)},
        ${input.valuation.marketScope},
        ${normalizeText(marketRecord?.plz_bereiche)},
        ${normalizeNumber(marketRecord?.median_preis_eur_m2)},
        ${normalizeNumber(marketRecord?.verkaeufe_anzahl)},
        ${normalizeNumber(marketRecord?.tage_am_markt)},
        ${normalizeNumber(marketRecord?.delta_vorjahr_median_prozent)},
        ${input.valuation.valueMin},
        ${input.valuation.valueMid},
        ${input.valuation.valueMax},
        ${valuationPayload},
        ${valuationBreakdown}
      )
      RETURNING *
    `) as LeadValuationRow[];

    return rows[0];
  }

  const rows = (await sql`
    UPDATE leads
    SET
      updated_at = NOW(),
      expires_at = ${input.expiresAt},
      fingerprint = ${input.leadProgress.fingerprint},
      token_hash = ${input.tokenHash},
      type = ${payload.propertyType},
      house_type = ${normalizeText(payload.houseType)},
      plz = ${normalizeText(payload.location?.postalCode)},
      city = ${normalizeText(payload.location?.city)},
      district = ${normalizeText(payload.location?.district)},
      street = ${normalizeText(payload.location?.street)},
      house_number = ${normalizeText(payload.location?.houseNumber)},
      location_text = ${locationText},
      living_area = ${normalizeNumber(payload.facts?.livingArea)},
      land_area = ${normalizeNumber(payload.facts?.landSize)},
      rooms = ${normalizeNumber(payload.facts?.rooms)},
      year_built = ${normalizeNumber(payload.facts?.yearBuilt)},
      energy_class = ${normalizeText(payload.facts?.energyClass)},
      condition = ${normalizeText(payload.facts?.condition)},
      quality = ${normalizeText(payload.facts?.qualityId)},
      extras = ${Array.isArray(payload.facts?.extras) ? JSON.stringify(payload.facts.extras) : null},
      other_extras = ${normalizeText(payload.facts?.otherExtras)},
      other_extras_value_eur = ${normalizeNumber(payload.facts?.otherExtrasValueEur)},
      reason = ${normalizeText(payload.facts?.reason)},
      usage = ${normalizeText(payload.facts?.usage)},
      email = ${normalizeText(payload.email)},
      salutation = ${normalizeText(person?.salutation)},
      first_name = ${normalizeText(person?.firstName)},
      last_name = ${normalizeText(person?.lastName)},
      name = ${name},
      phone = ${normalizeText(person?.phone)},
      consent = ${payload.consent === true},
      privacy_accepted_at = COALESCE(privacy_accepted_at, NOW()),
      market_location_id = ${normalizeText(marketRecord?.location_id)},
      market_location_label = ${normalizeText(marketRecord?.location_label)},
      market_scope = ${input.valuation.marketScope},
      market_plz_bereiche = ${normalizeText(marketRecord?.plz_bereiche)},
      market_median_preis_eur_m2 = ${normalizeNumber(marketRecord?.median_preis_eur_m2)},
      market_verkaeufe_anzahl = ${normalizeNumber(marketRecord?.verkaeufe_anzahl)},
      market_tage_am_markt = ${normalizeNumber(marketRecord?.tage_am_markt)},
      market_delta_vorjahr_median_prozent = ${normalizeNumber(marketRecord?.delta_vorjahr_median_prozent)},
      value_min = ${input.valuation.valueMin},
      value_mid = ${input.valuation.valueMid},
      value_max = ${input.valuation.valueMax},
      valuation_payload = ${valuationPayload},
      valuation_breakdown = ${valuationBreakdown}
    WHERE id = ${existing.id}
    RETURNING *
  `) as LeadValuationRow[];

  return rows[0];
}

export async function markLeadEmailSent(id: string, provider: string, messageId?: string | null) {
  await ensureLeadValuationTables();

  const rows = (await sql`
    UPDATE leads
    SET
      updated_at = NOW(),
      email_sent_at = NOW(),
      email_provider = ${provider},
      email_message_id = ${normalizeText(messageId)}
    WHERE id = ${id}
    RETURNING *
  `) as LeadValuationRow[];

  return rows[0] ?? null;
}

export async function getLeadByToken(token: string) {
  await ensureLeadValuationTables();
  const tokenHash = hashToken(token, requireTokenSecret());

  const rows = (await sql`
    SELECT *
    FROM leads
    WHERE token_hash = ${tokenHash}
    LIMIT 1
  `) as LeadValuationRow[];

  return rows[0] ?? null;
}

export async function trackLeadEvent(input: TrackLeadEventInput) {
  await ensureLeadValuationTables();
  const hashedIp = hashIp(input.ip);

  await sql`
    INSERT INTO lead_events (lead_id, event_type, user_agent, referer, ip_hash)
    VALUES (${input.leadId}, ${input.eventType}, ${normalizeText(input.userAgent)}, ${normalizeText(input.referer)}, ${hashedIp})
  `;

  if (input.eventType === "landing_view") {
    await sql`
      UPDATE leads
      SET
        updated_at = NOW(),
        opened_at = COALESCE(opened_at, NOW()),
        last_opened_at = NOW(),
        open_count = open_count + 1
      WHERE id = ${input.leadId}
    `;
  }

  if (input.eventType === "cta_precise_valuation_click") {
    await sql`
      UPDATE leads
      SET
        updated_at = NOW(),
        cta_clicked_at = NOW(),
        cta_click_count = cta_click_count + 1
      WHERE id = ${input.leadId}
    `;
  }

  if (input.eventType === "callback_requested") {
    await sql`
      UPDATE leads
      SET
        updated_at = NOW(),
        callback_requested_at = COALESCE(callback_requested_at, NOW()),
        cta_clicked_at = NOW(),
        cta_click_count = cta_click_count + 1
      WHERE id = ${input.leadId}
    `;
  }
}
