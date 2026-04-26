import { sql } from "@/lib/db";
import {
  buildLeadSyncFingerprint,
  mergeLeadSyncPayload,
  normalizeLeadEmail,
  type LeadSyncPayload,
} from "@/lib/lead-sync";

type LeadProgressRow = {
  id: string;
  created_at: string;
  fingerprint: string;
  status: string;
  email: string | null;
  payload: string;
  propstack_contact_id: number | null;
  propstack_property_id: number | null;
  propstack_deal_id: number | null;
  propstack_task_id: number | null;
  propstack_owner_linked_at: string | null;
  last_synced_at: string | null;
  last_error: string | null;
};

export type LeadProgressRecord = {
  id: string;
  createdAt: string;
  fingerprint: string;
  status: string;
  email: string | null;
  payload: LeadSyncPayload;
  propstackContactId: number | null;
  propstackPropertyId: number | null;
  propstackDealId: number | null;
  propstackTaskId: number | null;
  propstackOwnerLinkedAt: string | null;
  lastSyncedAt: string | null;
  lastError: string | null;
};

type UpsertLeadProgressInput = {
  leadId?: string | null;
  phase?: string | null;
  payload: LeadSyncPayload;
};

type LeadProgressSyncUpdate = {
  propstackContactId?: number | null;
  propstackPropertyId?: number | null;
  propstackDealId?: number | null;
  propstackTaskId?: number | null;
  ownerLinked?: boolean;
  lastError?: string | null;
};

function parsePayload(value: string | null): LeadSyncPayload {
  if (!value) return {};

  try {
    return JSON.parse(value) as LeadSyncPayload;
  } catch {
    return {};
  }
}

function mapLeadProgressRow(row: LeadProgressRow): LeadProgressRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    fingerprint: row.fingerprint,
    status: row.status,
    email: row.email,
    payload: parsePayload(row.payload),
    propstackContactId: row.propstack_contact_id,
    propstackPropertyId: row.propstack_property_id,
    propstackDealId: row.propstack_deal_id,
    propstackTaskId: row.propstack_task_id,
    propstackOwnerLinkedAt: row.propstack_owner_linked_at,
    lastSyncedAt: row.last_synced_at,
    lastError: row.last_error,
  };
}

export async function ensureLeadProgressTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS lead_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      fingerprint TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'LEAD',
      sync_phase TEXT,
      email TEXT,
      payload TEXT NOT NULL DEFAULT '{}',
      propstack_contact_id BIGINT,
      propstack_property_id BIGINT,
      propstack_deal_id BIGINT,
      propstack_task_id BIGINT,
      propstack_owner_linked_at TIMESTAMPTZ,
      last_synced_at TIMESTAMPTZ,
      last_error TEXT
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS lead_progress_email_idx ON lead_progress(email);`;
  await sql`CREATE INDEX IF NOT EXISTS lead_progress_status_idx ON lead_progress(status);`;
}

export async function getLeadProgressById(id: string) {
  await ensureLeadProgressTable();

  const rows = (await sql`
    SELECT
      id,
      created_at,
      fingerprint,
      status,
      email,
      payload,
      propstack_contact_id,
      propstack_property_id,
      propstack_deal_id,
      propstack_task_id,
      propstack_owner_linked_at,
      last_synced_at,
      last_error
    FROM lead_progress
    WHERE id = ${id}
    LIMIT 1
  `) as LeadProgressRow[];

  return rows[0] ? mapLeadProgressRow(rows[0]) : null;
}

async function getLeadProgressByFingerprint(fingerprint: string) {
  const rows = (await sql`
    SELECT
      id,
      created_at,
      fingerprint,
      status,
      email,
      payload,
      propstack_contact_id,
      propstack_property_id,
      propstack_deal_id,
      propstack_task_id,
      propstack_owner_linked_at,
      last_synced_at,
      last_error
    FROM lead_progress
    WHERE fingerprint = ${fingerprint}
    LIMIT 1
  `) as LeadProgressRow[];

  return rows[0] ? mapLeadProgressRow(rows[0]) : null;
}

export async function upsertLeadProgress(input: UpsertLeadProgressInput) {
  await ensureLeadProgressTable();

  const existing =
    input.leadId && input.leadId.trim().length > 0
      ? await getLeadProgressById(input.leadId)
      : await getLeadProgressByFingerprint(buildLeadSyncFingerprint(input.payload));

  const mergedPayload = mergeLeadSyncPayload(existing?.payload, input.payload);
  const email = normalizeLeadEmail(mergedPayload.email);
  const fingerprint = buildLeadSyncFingerprint(mergedPayload);
  const payloadText = JSON.stringify(mergedPayload);

  if (!existing) {
    const inserted = (await sql`
      INSERT INTO lead_progress (
        fingerprint,
        status,
        sync_phase,
        email,
        payload,
        last_error
      )
      VALUES (
        ${fingerprint},
        'LEAD',
        ${input.phase ?? null},
        ${email || null},
        ${payloadText},
        NULL
      )
      RETURNING
        id,
        created_at,
        fingerprint,
        status,
        email,
        payload,
        propstack_contact_id,
        propstack_property_id,
        propstack_deal_id,
        propstack_task_id,
        propstack_owner_linked_at,
        last_synced_at,
        last_error
    `) as LeadProgressRow[];

    return mapLeadProgressRow(inserted[0]);
  }

  const updated = (await sql`
    UPDATE lead_progress
    SET
      updated_at = NOW(),
      fingerprint = ${fingerprint},
      status = 'LEAD',
      sync_phase = ${input.phase ?? null},
      email = ${email || null},
      payload = ${payloadText},
      last_error = NULL
    WHERE id = ${existing.id}
    RETURNING
      id,
      created_at,
      fingerprint,
      status,
      email,
      payload,
      propstack_contact_id,
      propstack_property_id,
      propstack_deal_id,
      propstack_task_id,
      propstack_owner_linked_at,
      last_synced_at,
      last_error
  `) as LeadProgressRow[];

  return mapLeadProgressRow(updated[0]);
}

export async function updateLeadProgressSyncState(id: string, update: LeadProgressSyncUpdate) {
  await ensureLeadProgressTable();

  const ownerLinkedAt = update.ownerLinked ? new Date().toISOString() : null;
  const hasError = typeof update.lastError === "string" && update.lastError.trim().length > 0;

  const rows = (await sql`
    UPDATE lead_progress
    SET
      updated_at = NOW(),
      last_synced_at = CASE
        WHEN ${hasError} THEN last_synced_at
        ELSE NOW()
      END,
      last_error = ${update.lastError ?? null},
      propstack_contact_id = COALESCE(${update.propstackContactId ?? null}, propstack_contact_id),
      propstack_property_id = COALESCE(${update.propstackPropertyId ?? null}, propstack_property_id),
      propstack_deal_id = COALESCE(${update.propstackDealId ?? null}, propstack_deal_id),
      propstack_task_id = COALESCE(${update.propstackTaskId ?? null}, propstack_task_id),
      propstack_owner_linked_at = COALESCE(${ownerLinkedAt}, propstack_owner_linked_at)
    WHERE id = ${id}
    RETURNING
      id,
      created_at,
      fingerprint,
      status,
      email,
      payload,
      propstack_contact_id,
      propstack_property_id,
      propstack_deal_id,
      propstack_task_id,
      propstack_owner_linked_at,
      last_synced_at,
      last_error
  `) as LeadProgressRow[];

  return rows[0] ? mapLeadProgressRow(rows[0]) : null;
}
