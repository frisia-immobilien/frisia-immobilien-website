import { NextResponse } from "next/server";
import { z } from "zod";

import { calculateLeadReportForLead } from "@/lib/leadgen/calculateLeadReport";
import { assertRateLimit, getClientIp } from "@/lib/security/rateLimit";

export const runtime = "nodejs";

const bodySchema = z.object({
  lead_request_id: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    assertRateLimit(`lead:calculate:${getClientIp(request)}`);

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Lead-ID fehlt." }, { status: 400 });
    }

    const result = await calculateLeadReportForLead({
      leadRequestId: parsed.data.lead_request_id,
      request,
    });

    return NextResponse.json(result, { status: "status" in result ? result.status : 200 });
  } catch (error) {
    const retryAfter = (error as Error & { retryAfterSeconds?: number }).retryAfterSeconds;
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Bewertung konnte gerade nicht berechnet werden." },
      { status: retryAfter ? 429 : 500, headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined },
    );
  }
}
