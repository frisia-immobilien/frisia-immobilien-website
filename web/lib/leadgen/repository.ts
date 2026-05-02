import "server-only";

import { sql } from "@/lib/db";
import { hashToken } from "@/lib/security/hashToken";
import type {
  LeadEventName,
  LeadReportRow,
  LeadReportWithRequest,
  LeadRequestRow,
  LeadStatus,
  MarketDataRow,
} from "@/lib/types/leadgen";
import type { LeadPayload } from "@/lib/leadgen/validation";
import type { ValuationResult } from "@/lib/valuation/calculateValuation";

function normalizeText(value: unknown) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function normalizeEmail(value: unknown) {
  return normalizeText(value)?.toLowerCase() ?? null;
}

let leadRequestExtraColumnsReady: Promise<void> | null = null;

function ensureLeadRequestExtraColumns() {
  leadRequestExtraColumnsReady ??= (async () => {
    await sql`
      ALTER TABLE lead_requests
        ADD COLUMN IF NOT EXISTS other_extras TEXT,
        ADD COLUMN IF NOT EXISTS other_extras_value_eur NUMERIC(12,2)
    `;
  })();
  return leadRequestExtraColumnsReady;
}

export async function getLeadRequestById(id: string) {
  const rows = (await sql`SELECT * FROM lead_requests WHERE id = ${id} LIMIT 1`) as LeadRequestRow[];
  return rows[0] ?? null;
}

export async function getLatestLeadRequestByEmail(email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  const rows = (await sql`
    SELECT *
    FROM lead_requests
    WHERE email = ${normalized}
    ORDER BY created_at DESC
    LIMIT 1
  `) as LeadRequestRow[];
  return rows[0] ?? null;
}

export async function upsertLeadRequest(input: {
  leadId?: string | null;
  payload: LeadPayload;
  status?: LeadStatus;
  ipHash?: string | null;
  userAgentHash?: string | null;
}) {
  await ensureLeadRequestExtraColumns();

  const existing = input.leadId ? await getLeadRequestById(input.leadId) : null;

  const status = input.status ?? (input.payload.email ? "email_captured" : "started");
  const consentTimestamp = input.payload.consent_given ? new Date() : null;

  if (!existing) {
    const rows = (await sql`
      INSERT INTO lead_requests (
        email,
        firstname,
        lastname,
        phone,
        object_type,
        sub_type,
        reason,
        selling_intent,
        timeline,
        street,
        house_number,
        postal_code,
        city,
        district,
        landkreis,
        lat,
        lng,
        living_area,
        plot_area,
        rooms,
        construction_year,
        condition,
        equipment,
        energy_class,
        floor,
        elevator,
        balcony,
        garden,
        garage,
        basement,
        other_extras,
        other_extras_value_eur,
        renovation_status,
        heating_type,
        consent_given,
        consent_timestamp,
        privacy_version,
        marketing_consent,
        status,
        ip_hash,
        user_agent_hash
      )
      VALUES (
        ${normalizeEmail(input.payload.email)},
        ${normalizeText(input.payload.firstname)},
        ${normalizeText(input.payload.lastname)},
        ${normalizeText(input.payload.phone)},
        ${input.payload.object_type ?? null},
        ${normalizeText(input.payload.sub_type)},
        ${normalizeText(input.payload.reason)},
        ${normalizeText(input.payload.selling_intent)},
        ${normalizeText(input.payload.timeline)},
        ${normalizeText(input.payload.street)},
        ${normalizeText(input.payload.house_number)},
        ${normalizeText(input.payload.postal_code)},
        ${normalizeText(input.payload.city)},
        ${normalizeText(input.payload.district)},
        ${normalizeText(input.payload.landkreis)},
        ${normalizeNumber(input.payload.lat)},
        ${normalizeNumber(input.payload.lng)},
        ${normalizeNumber(input.payload.living_area)},
        ${normalizeNumber(input.payload.plot_area)},
        ${normalizeNumber(input.payload.rooms)},
        ${normalizeNumber(input.payload.construction_year)},
        ${normalizeText(input.payload.condition)},
        ${normalizeText(input.payload.equipment)},
        ${normalizeText(input.payload.energy_class)},
        ${normalizeNumber(input.payload.floor)},
        ${normalizeBoolean(input.payload.elevator)},
        ${normalizeBoolean(input.payload.balcony)},
        ${normalizeBoolean(input.payload.garden)},
        ${normalizeBoolean(input.payload.garage)},
        ${normalizeBoolean(input.payload.basement)},
        ${normalizeText(input.payload.other_extras)},
        ${normalizeNumber(input.payload.other_extras_value_eur)},
        ${normalizeText(input.payload.renovation_status)},
        ${normalizeText(input.payload.heating_type)},
        ${input.payload.consent_given === true},
        ${consentTimestamp},
        ${normalizeText(input.payload.privacy_version) ?? "2026-04-26"},
        ${input.payload.marketing_consent === true},
        ${status},
        ${input.ipHash ?? null},
        ${input.userAgentHash ?? null}
      )
      RETURNING *
    `) as LeadRequestRow[];

    return rows[0];
  }

  const rows = (await sql`
    UPDATE lead_requests
    SET
      email = COALESCE(${normalizeEmail(input.payload.email)}, email),
      firstname = COALESCE(${normalizeText(input.payload.firstname)}, firstname),
      lastname = COALESCE(${normalizeText(input.payload.lastname)}, lastname),
      phone = COALESCE(${normalizeText(input.payload.phone)}, phone),
      object_type = COALESCE(${input.payload.object_type ?? null}, object_type),
      sub_type = COALESCE(${normalizeText(input.payload.sub_type)}, sub_type),
      reason = COALESCE(${normalizeText(input.payload.reason)}, reason),
      selling_intent = COALESCE(${normalizeText(input.payload.selling_intent)}, selling_intent),
      timeline = COALESCE(${normalizeText(input.payload.timeline)}, timeline),
      street = COALESCE(${normalizeText(input.payload.street)}, street),
      house_number = COALESCE(${normalizeText(input.payload.house_number)}, house_number),
      postal_code = COALESCE(${normalizeText(input.payload.postal_code)}, postal_code),
      city = COALESCE(${normalizeText(input.payload.city)}, city),
      district = COALESCE(${normalizeText(input.payload.district)}, district),
      landkreis = COALESCE(${normalizeText(input.payload.landkreis)}, landkreis),
      lat = COALESCE(${normalizeNumber(input.payload.lat)}, lat),
      lng = COALESCE(${normalizeNumber(input.payload.lng)}, lng),
      living_area = COALESCE(${normalizeNumber(input.payload.living_area)}, living_area),
      plot_area = COALESCE(${normalizeNumber(input.payload.plot_area)}, plot_area),
      rooms = COALESCE(${normalizeNumber(input.payload.rooms)}, rooms),
      construction_year = COALESCE(${normalizeNumber(input.payload.construction_year)}, construction_year),
      condition = COALESCE(${normalizeText(input.payload.condition)}, condition),
      equipment = COALESCE(${normalizeText(input.payload.equipment)}, equipment),
      energy_class = COALESCE(${normalizeText(input.payload.energy_class)}, energy_class),
      floor = COALESCE(${normalizeNumber(input.payload.floor)}, floor),
      elevator = COALESCE(${normalizeBoolean(input.payload.elevator)}, elevator),
      balcony = COALESCE(${normalizeBoolean(input.payload.balcony)}, balcony),
      garden = COALESCE(${normalizeBoolean(input.payload.garden)}, garden),
      garage = COALESCE(${normalizeBoolean(input.payload.garage)}, garage),
      basement = COALESCE(${normalizeBoolean(input.payload.basement)}, basement),
      other_extras = COALESCE(${normalizeText(input.payload.other_extras)}, other_extras),
      other_extras_value_eur = COALESCE(${normalizeNumber(input.payload.other_extras_value_eur)}, other_extras_value_eur),
      renovation_status = COALESCE(${normalizeText(input.payload.renovation_status)}, renovation_status),
      heating_type = COALESCE(${normalizeText(input.payload.heating_type)}, heating_type),
      consent_given = consent_given OR ${input.payload.consent_given === true},
      consent_timestamp = COALESCE(consent_timestamp, ${consentTimestamp}),
      privacy_version = COALESCE(${normalizeText(input.payload.privacy_version)}, privacy_version),
      marketing_consent = marketing_consent OR ${input.payload.marketing_consent === true},
      status = ${status},
      ip_hash = COALESCE(${input.ipHash ?? null}, ip_hash),
      user_agent_hash = COALESCE(${input.userAgentHash ?? null}, user_agent_hash)
    WHERE id = ${existing.id}
    RETURNING *
  `) as LeadRequestRow[];

  return rows[0];
}

export async function updateLeadPropstackIds(input: {
  leadId: string;
  contactId?: number | null;
  propertyId?: number | null;
}) {
  const rows = (await sql`
    UPDATE lead_requests
    SET
      propstack_contact_id = COALESCE(${input.contactId ?? null}, propstack_contact_id),
      propstack_property_id = COALESCE(${input.propertyId ?? null}, propstack_property_id)
    WHERE id = ${input.leadId}
    RETURNING *
  `) as LeadRequestRow[];
  return rows[0] ?? null;
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const rows = (await sql`
    UPDATE lead_requests
    SET status = ${status}
    WHERE id = ${leadId}
    RETURNING *
  `) as LeadRequestRow[];
  return rows[0] ?? null;
}

export async function insertLeadEvent(input: {
  leadRequestId: string;
  eventName: LeadEventName;
  payload?: unknown;
}) {
  await sql`
    INSERT INTO lead_events (lead_request_id, event_name, event_payload_json)
    VALUES (${input.leadRequestId}, ${input.eventName}, ${JSON.stringify(input.payload ?? null)}::jsonb)
  `;
}

export async function createLeadReport(input: {
  lead: LeadRequestRow;
  token: string;
  expiresAt: Date;
  valuation: ValuationResult;
  marketDataId?: string | null;
}) {
  const tokenHash = hashToken(input.token);
  const rows = (await sql`
    INSERT INTO lead_reports (
      lead_request_id,
      token_hash,
      expires_at,
      base_value,
      adjusted_value,
      range_min,
      range_max,
      price_per_m2_min,
      price_per_m2_max,
      data_source,
      market_level_used,
      market_data_id,
      accuracy_score,
      confidence_label,
      calculation_notes,
      report_status
    )
    VALUES (
      ${input.lead.id},
      ${tokenHash},
      ${input.expiresAt},
      ${input.valuation.base_value},
      ${input.valuation.adjusted_value},
      ${input.valuation.range_min},
      ${input.valuation.range_max},
      ${input.valuation.price_per_m2_min},
      ${input.valuation.price_per_m2_max},
      ${input.valuation.data_source},
      ${input.valuation.market_level_used},
      ${input.marketDataId ?? null},
      ${input.valuation.accuracy_score},
      ${input.valuation.confidence_label},
      ${input.valuation.calculation_notes},
      'active'
    )
    RETURNING *
  `) as LeadReportRow[];

  await updateLeadStatus(input.lead.id, "valuation_calculated");
  return getLeadReportById(rows[0].id);
}

export async function createManualLeadReport(input: {
  lead: LeadRequestRow;
  token: string;
  expiresAt: Date;
  reason: string;
}) {
  const tokenHash = hashToken(input.token);
  const rows = (await sql`
    INSERT INTO lead_reports (
      lead_request_id,
      token_hash,
      expires_at,
      data_source,
      market_level_used,
      confidence_label,
      calculation_notes,
      report_status
    )
    VALUES (
      ${input.lead.id},
      ${tokenHash},
      ${input.expiresAt},
      'manual',
      'none',
      'Persönliche Prüfung',
      ${input.reason},
      'active'
    )
    RETURNING *
  `) as LeadReportRow[];

  await updateLeadStatus(input.lead.id, "valuation_calculated");
  return getLeadReportById(rows[0].id);
}

export async function getLeadReportById(id: string): Promise<LeadReportWithRequest | null> {
  const rows = (await sql`
    SELECT
      lr.*,
      to_jsonb(lreq.*) AS lead_request,
      to_jsonb(md.*) AS market_data
    FROM lead_reports lr
    JOIN lead_requests lreq ON lreq.id = lr.lead_request_id
    LEFT JOIN market_data md ON md.id = lr.market_data_id
    WHERE lr.id = ${id}
    LIMIT 1
  `) as Array<LeadReportRow & { lead_request: LeadRequestRow; market_data: MarketDataRow | null }>;
  return rows[0] ?? null;
}

export async function getLatestLeadReportByLeadId(leadRequestId: string): Promise<LeadReportWithRequest | null> {
  const rows = (await sql`
    SELECT
      lr.*,
      to_jsonb(lreq.*) AS lead_request,
      to_jsonb(md.*) AS market_data
    FROM lead_reports lr
    JOIN lead_requests lreq ON lreq.id = lr.lead_request_id
    LEFT JOIN market_data md ON md.id = lr.market_data_id
    WHERE lr.lead_request_id = ${leadRequestId}
    ORDER BY lr.created_at DESC
    LIMIT 1
  `) as Array<LeadReportRow & { lead_request: LeadRequestRow; market_data: MarketDataRow | null }>;
  return rows[0] ?? null;
}

export async function createLeadReportCopyWithToken(input: {
  sourceReport: LeadReportWithRequest;
  token: string;
  expiresAt: Date;
}) {
  const tokenHash = hashToken(input.token);
  const rows = (await sql`
    INSERT INTO lead_reports (
      lead_request_id,
      token_hash,
      expires_at,
      base_value,
      adjusted_value,
      range_min,
      range_max,
      price_per_m2_min,
      price_per_m2_max,
      data_source,
      market_level_used,
      market_data_id,
      accuracy_score,
      confidence_label,
      calculation_notes,
      report_status
    )
    VALUES (
      ${input.sourceReport.lead_request_id},
      ${tokenHash},
      ${input.expiresAt},
      ${input.sourceReport.base_value},
      ${input.sourceReport.adjusted_value},
      ${input.sourceReport.range_min},
      ${input.sourceReport.range_max},
      ${input.sourceReport.price_per_m2_min},
      ${input.sourceReport.price_per_m2_max},
      ${input.sourceReport.data_source},
      ${input.sourceReport.market_level_used},
      ${input.sourceReport.market_data_id},
      ${input.sourceReport.accuracy_score},
      ${input.sourceReport.confidence_label},
      ${input.sourceReport.calculation_notes},
      'active'
    )
    RETURNING *
  `) as LeadReportRow[];

  return getLeadReportById(rows[0].id);
}

export async function getLeadReportByToken(token: string): Promise<LeadReportWithRequest | null> {
  const tokenHash = hashToken(token);
  const rows = (await sql`
    SELECT
      lr.*,
      to_jsonb(lreq.*) AS lead_request,
      to_jsonb(md.*) AS market_data
    FROM lead_reports lr
    JOIN lead_requests lreq ON lreq.id = lr.lead_request_id
    LEFT JOIN market_data md ON md.id = lr.market_data_id
    WHERE lr.token_hash = ${tokenHash}
    LIMIT 1
  `) as Array<LeadReportRow & { lead_request: LeadRequestRow; market_data: MarketDataRow | null }>;
  return rows[0] ?? null;
}

export async function markReportOpened(reportId: string, leadRequestId: string) {
  await sql`
    UPDATE lead_reports
    SET opened_at = COALESCE(opened_at, NOW()), last_opened_at = NOW()
    WHERE id = ${reportId}
  `;
  await updateLeadStatus(leadRequestId, "opened");
  await insertLeadEvent({ leadRequestId, eventName: "report_opened" });
}
