import { NextResponse } from "next/server";

import { hasLeadSyncCaptureRequirements, type LeadSyncPayload } from "@/lib/lead-sync";
import { insertLeadEvent, updateLeadPropstackIds, upsertLeadRequest } from "@/lib/leadgen/repository";
import { mapLeadSyncPayloadToLeadPayload } from "@/lib/leadgen/leadSyncAdapter";
import { leadCreateSchema } from "@/lib/leadgen/validation";
import { geocodeAddress } from "@/lib/market/geocodeAddress";
import { createOrUpdateContact, createOrUpdateProperty } from "@/lib/propstack/client";
import { hashPrivacyValue } from "@/lib/security/hashToken";
import { assertRateLimit, getClientIp } from "@/lib/security/rateLimit";

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

function hasAddress(value: {
  street?: string | null;
  house_number?: string | null;
  postal_code?: string | null;
  city?: string | null;
}) {
  return Boolean(value.street && value.house_number && value.postal_code && value.city);
}

export async function POST(request: Request) {
  let leadId: string | null = null;

  try {
    const clientIp = getClientIp(request);
    assertRateLimit(`lead:sync:${clientIp}`, 20);

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

    let payload = mapLeadSyncPayloadToLeadPayload(body.payload);
    payload = { ...payload, id: body.leadId ?? payload.id };

    const parsed = leadCreateSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingaben." },
        { status: 400 },
      );
    }

    payload = parsed.data;

    if (hasAddress(payload) && (payload.lat == null || payload.lng == null)) {
      const geocoded = await geocodeAddress(payload);
      if (geocoded) {
        payload = {
          ...payload,
          lat: geocoded.lat,
          lng: geocoded.lng,
          district: payload.district ?? geocoded.district ?? null,
          city: payload.city ?? geocoded.city ?? null,
          landkreis: payload.landkreis ?? geocoded.landkreis ?? null,
        };
      }
    }

    let lead = await upsertLeadRequest({
      leadId: body.leadId,
      payload,
      status: hasAddress(payload) ? "address_captured" : payload.email ? "email_captured" : "started",
      ipHash: hashPrivacyValue(clientIp),
      userAgentHash: hashPrivacyValue(request.headers.get("user-agent")),
    });
    leadId = lead.id;

    if (payload.object_type) {
      await insertLeadEvent({
        leadRequestId: lead.id,
        eventName: "object_type_selected",
        payload: { object_type: payload.object_type, phase: body.phase ?? null },
      });
    }

    if (payload.email) {
      await insertLeadEvent({
        leadRequestId: lead.id,
        eventName: "email_entered",
        payload: { phase: body.phase ?? null },
      });
    }

    if (hasAddress(payload)) {
      await insertLeadEvent({
        leadRequestId: lead.id,
        eventName: "address_entered",
        payload: { geocoded: payload.lat != null && payload.lng != null, phase: body.phase ?? null },
      });
    }

    try {
      if (lead.email) {
        const contactId = await createOrUpdateContact({
          contactId: lead.propstack_contact_id,
          email: lead.email,
          firstname: lead.firstname,
          lastname: lead.lastname,
          phone: lead.phone,
          consent: lead.consent_given,
        });

        if (contactId) {
          lead = (await updateLeadPropstackIds({ leadId: lead.id, contactId })) ?? lead;
          await insertLeadEvent({
            leadRequestId: lead.id,
            eventName: lead.propstack_contact_id ? "propstack_contact_updated" : "propstack_contact_created",
            payload: { contactId },
          });
        }
      }

      if (hasAddress(lead)) {
        const propertyId = await createOrUpdateProperty({
          propertyId: lead.propstack_property_id,
          lead,
        });

        if (propertyId) {
          lead = (await updateLeadPropstackIds({ leadId: lead.id, propertyId })) ?? lead;
          await insertLeadEvent({
            leadRequestId: lead.id,
            eventName: "propstack_property_created",
            payload: { propertyId },
          });
        }
      }
    } catch (error) {
      await insertLeadEvent({
        leadRequestId: lead.id,
        eventName: "valuation_failed",
        payload: { stage: "propstack_sync", message: error instanceof Error ? error.message : String(error) },
      });
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      leadRequestId: lead.id,
      status: lead.status,
      propstack: {
        contactId: lead.propstack_contact_id,
        propertyId: lead.propstack_property_id,
      },
    });
  } catch (error: unknown) {
    const retryAfter = (error as Error & { retryAfterSeconds?: number }).retryAfterSeconds;
    return NextResponse.json(
      {
        success: false,
        leadId,
        error: error instanceof Error ? error.message : "Lead-Sync fehlgeschlagen.",
      },
      { status: retryAfter ? 429 : 500, headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined },
    );
  }
}
