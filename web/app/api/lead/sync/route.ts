import { NextResponse } from "next/server";
import {
  type LeadProgressRecord,
  updateLeadProgressSyncState,
  upsertLeadProgress,
} from "@/lib/lead-progress";
import { hasLeadSyncCaptureRequirements, type LeadSyncPayload } from "@/lib/lead-sync";
import { syncLeadProgressToPropstack } from "@/lib/propstack-crm";

export const runtime = "nodejs";

type LeadSyncBody = {
  leadId?: string | null;
  phase?: string | null;
  payload?: LeadSyncPayload;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isLeadSyncPayload(value: unknown): value is LeadSyncPayload {
  return isObject(value);
}

async function persistAndSyncLead(progress: LeadProgressRecord) {
  const synced = await syncLeadProgressToPropstack(progress);

  await updateLeadProgressSyncState(progress.id, {
    propstackContactId: synced.contactId,
    propstackPropertyId: synced.propertyId,
    propstackDealId: synced.dealId,
    propstackTaskId: synced.taskId,
    ownerLinked: synced.ownerLinked,
    lastError: null,
  });

  return synced;
}

export async function POST(request: Request) {
  let progress: LeadProgressRecord | null = null;

  try {
    const body = (await request.json()) as LeadSyncBody;

    if (!isLeadSyncPayload(body.payload)) {
      return NextResponse.json(
        { success: false, error: "Lead-Sync-Payload fehlt oder ist ungültig." },
        { status: 400 },
      );
    }

    if (!hasLeadSyncCaptureRequirements(body.payload) && !body.leadId) {
      return NextResponse.json(
        {
          success: false,
          error: "Für den ersten Sync werden mindestens Adresse, E-Mail und Einwilligung benötigt.",
        },
        { status: 400 },
      );
    }

    progress = await upsertLeadProgress({
      leadId: body.leadId,
      phase: body.phase,
      payload: body.payload,
    });

    const synced = await persistAndSyncLead(progress);

    return NextResponse.json({
      success: true,
      leadId: progress.id,
      status: "LEAD",
      propstack: {
        contactId: synced.contactId,
        propertyId: synced.propertyId,
        dealId: synced.dealId,
        taskId: synced.taskId,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    if (progress) {
      await updateLeadProgressSyncState(progress.id, {
        lastError: message,
      });
    }

    return NextResponse.json(
      {
        success: false,
        leadId: progress?.id ?? null,
        error: message,
      },
      { status: 500 },
    );
  }
}
