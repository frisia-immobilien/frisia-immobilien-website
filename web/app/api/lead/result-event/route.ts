import { NextResponse } from "next/server";

import { getLeadReportByToken, insertLeadEvent } from "@/lib/leadgen/repository";
import { assertRateLimit, getClientIp } from "@/lib/security/rateLimit";
import type { LeadEventName } from "@/lib/types/leadgen";

export const runtime = "nodejs";

type ResultEvent =
  | "result_page_opened"
  | "price_range_seen"
  | "primary_cta_clicked"
  | "callback_cta_clicked"
  | "manual_review_seen"
  | "trust_block_seen"
  | "result_page_abandoned"
  | "email_link_opened";

const VALID_EVENTS = new Set<ResultEvent>([
  "result_page_opened",
  "price_range_seen",
  "primary_cta_clicked",
  "callback_cta_clicked",
  "manual_review_seen",
  "trust_block_seen",
  "result_page_abandoned",
  "email_link_opened",
]);

function mapEvent(eventType: ResultEvent): LeadEventName {
  if (eventType === "primary_cta_clicked") return "cta_clicked";
  if (eventType === "callback_cta_clicked") return "phone_clicked";
  return "report_opened";
}

function getClientIpSafe(request: Request) {
  try {
    return getClientIp(request);
  } catch {
    return "unknown";
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit(`lead:result-event:${getClientIpSafe(request)}`, 120);

    const body = (await request.json()) as { token?: unknown; eventType?: unknown };
    const token = String(body.token ?? "").trim();
    const eventType = body.eventType as ResultEvent | undefined;

    if (!token || !eventType || !VALID_EVENTS.has(eventType)) {
      return NextResponse.json({ success: false, error: "Ungültiges Ergebnis-Event." }, { status: 400 });
    }

    const report = await getLeadReportByToken(token);
    if (!report) {
      return NextResponse.json({ success: false, error: "Bewertungsreport nicht gefunden." }, { status: 404 });
    }

    await insertLeadEvent({
      leadRequestId: report.lead_request_id,
      eventName: mapEvent(eventType),
      payload: {
        result_event: eventType,
        report_id: report.id,
        user_agent: request.headers.get("user-agent"),
        referer: request.headers.get("referer"),
      },
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
