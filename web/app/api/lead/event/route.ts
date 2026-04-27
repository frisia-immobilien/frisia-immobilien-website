import { NextResponse } from "next/server";

import { insertLeadEvent } from "@/lib/leadgen/repository";
import { leadEventSchema } from "@/lib/leadgen/validation";
import { assertRateLimit, getClientIp } from "@/lib/security/rateLimit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertRateLimit(`lead:event:${getClientIp(request)}`, 60);

    const parsed = leadEventSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Ungültiges Event." }, { status: 400 });
    }

    await insertLeadEvent({
      leadRequestId: parsed.data.lead_request_id,
      eventName: parsed.data.event_name,
      payload: parsed.data.event_payload_json ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const retryAfter = (error as Error & { retryAfterSeconds?: number }).retryAfterSeconds;
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Event konnte nicht gespeichert werden." },
      { status: retryAfter ? 429 : 500, headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined },
    );
  }
}
