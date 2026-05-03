import { NextResponse } from "next/server";

import { geocodeAddress } from "@/lib/market/geocodeAddress";
import { leadCreateSchema } from "@/lib/leadgen/validation";
import {
  getLeadRequestById,
  insertLeadEvent,
  updateLeadPropstackIds,
  upsertLeadRequest,
} from "@/lib/leadgen/repository";
import { createOrUpdateContact, createOrUpdateDeal, createOrUpdateProperty } from "@/lib/propstack/client";
import { getClientIp, assertRateLimit } from "@/lib/security/rateLimit";
import { hashPrivacyValue } from "@/lib/security/hashToken";

export const runtime = "nodejs";

function hasAddress(value: {
  street?: string | null;
  house_number?: string | null;
  postal_code?: string | null;
  city?: string | null;
}) {
  return Boolean(value.street && value.house_number && value.postal_code && value.city);
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    assertRateLimit(`lead:update:${clientIp}`, 20);

    const parsed = leadCreateSchema.safeParse(await request.json());
    if (!parsed.success || !parsed.data.id) {
      return NextResponse.json(
        { success: false, error: parsed.success ? "Lead-ID fehlt." : parsed.error.issues[0]?.message },
        { status: 400 },
      );
    }

    let payload = parsed.data;
    const existing = await getLeadRequestById(parsed.data.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Lead nicht gefunden." }, { status: 404 });
    }

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

    const status = hasAddress(payload) ? "address_captured" : payload.email ? "email_captured" : existing.status;
    let lead = await upsertLeadRequest({
      leadId: existing.id,
      payload,
      status,
      ipHash: hashPrivacyValue(clientIp),
      userAgentHash: hashPrivacyValue(request.headers.get("user-agent")),
    });

    if (hasAddress(payload)) {
      await insertLeadEvent({
        leadRequestId: lead.id,
        eventName: "address_entered",
        payload: { geocoded: payload.lat != null && payload.lng != null },
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

      if (lead.propstack_contact_id && lead.propstack_property_id) {
        const previousDealId = lead.propstack_deal_id;
        const dealId = await createOrUpdateDeal({
          dealId: lead.propstack_deal_id,
          contactId: lead.propstack_contact_id,
          propertyId: lead.propstack_property_id,
          lead,
        });
        if (dealId) {
          lead = (await updateLeadPropstackIds({ leadId: lead.id, dealId })) ?? lead;
          await insertLeadEvent({
            leadRequestId: lead.id,
            eventName: previousDealId ? "propstack_deal_updated" : "propstack_deal_created",
            payload: { dealId },
          });
        }
      }
    } catch (error) {
      await insertLeadEvent({
        leadRequestId: lead.id,
        eventName: "valuation_failed",
        payload: { stage: "propstack_update", message: error instanceof Error ? error.message : String(error) },
      });
    }

    return NextResponse.json({ success: true, leadRequestId: lead.id, status: lead.status });
  } catch (error) {
    const retryAfter = (error as Error & { retryAfterSeconds?: number }).retryAfterSeconds;
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Die Anfrage konnte gerade nicht verarbeitet werden.",
      },
      { status: retryAfter ? 429 : 500, headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined },
    );
  }
}
