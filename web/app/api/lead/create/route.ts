import { NextResponse } from "next/server";

import { leadCreateSchema } from "@/lib/leadgen/validation";
import { insertLeadEvent, updateLeadPropstackIds, upsertLeadRequest } from "@/lib/leadgen/repository";
import { createOrUpdateContact } from "@/lib/propstack/client";
import { getClientIp, assertRateLimit } from "@/lib/security/rateLimit";
import { hashPrivacyValue } from "@/lib/security/hashToken";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    assertRateLimit(`lead:create:${clientIp}`);

    const parsed = leadCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingaben." },
        { status: 400 },
      );
    }

    const lead = await upsertLeadRequest({
      leadId: parsed.data.id,
      payload: parsed.data,
      status: parsed.data.email ? "email_captured" : "started",
      ipHash: hashPrivacyValue(clientIp),
      userAgentHash: hashPrivacyValue(request.headers.get("user-agent")),
    });

    if (parsed.data.object_type) {
      await insertLeadEvent({
        leadRequestId: lead.id,
        eventName: "object_type_selected",
        payload: { object_type: parsed.data.object_type },
      });
    }

    if (parsed.data.email) {
      await insertLeadEvent({
        leadRequestId: lead.id,
        eventName: "email_entered",
        payload: { email_captured: true },
      });

      try {
        const contactId = await createOrUpdateContact({
          contactId: lead.propstack_contact_id,
          email: parsed.data.email,
          firstname: parsed.data.firstname,
          lastname: parsed.data.lastname,
          phone: parsed.data.phone,
          consent: parsed.data.consent_given,
        });

        if (contactId) {
          await updateLeadPropstackIds({ leadId: lead.id, contactId });
          await insertLeadEvent({
            leadRequestId: lead.id,
            eventName: lead.propstack_contact_id ? "propstack_contact_updated" : "propstack_contact_created",
            payload: { contactId },
          });
        }
      } catch (error) {
        await insertLeadEvent({
          leadRequestId: lead.id,
          eventName: "valuation_failed",
          payload: { stage: "propstack_contact", message: error instanceof Error ? error.message : String(error) },
        });
      }
    }

    return NextResponse.json({
      success: true,
      leadRequestId: lead.id,
      status: parsed.data.email ? "email_captured" : "started",
    });
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
