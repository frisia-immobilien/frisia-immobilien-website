import { NextResponse } from "next/server";

import { sendLeadCallbackRequestedNotification } from "@/lib/immobilienbewertung/lead-emails";
import { getLeadByToken, trackLeadEvent } from "@/lib/immobilienbewertung/lead-records";

export const runtime = "nodejs";

type LeadTrackEvent = "landing_view" | "cta_precise_valuation_click" | "callback_requested";

type LeadTrackBody = {
  token?: string | null;
  eventType?: LeadTrackEvent;
};

const VALID_EVENTS = new Set<LeadTrackEvent>([
  "landing_view",
  "cta_precise_valuation_click",
  "callback_requested",
]);

function getBaseUrl(request: Request) {
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  }

  const proto = request.headers.get("x-forwarded-proto") || "http";
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "localhost:3000";

  return `${proto}://${host}`;
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || null;
  }

  return request.headers.get("x-real-ip");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeadTrackBody;
    const token = String(body.token ?? "").trim();
    const eventType = body.eventType;

    if (!token || !eventType || !VALID_EVENTS.has(eventType)) {
      return NextResponse.json(
        { success: false, error: "Token oder Eventtyp fehlt." },
        { status: 400 },
      );
    }

    const lead = await getLeadByToken(token);
    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead nicht gefunden." },
        { status: 404 },
      );
    }

    await trackLeadEvent({
      leadId: lead.id,
      eventType,
      userAgent: request.headers.get("user-agent"),
      referer: request.headers.get("referer"),
      ip: getClientIp(request),
    });

    if (eventType === "callback_requested" && !lead.callback_requested_at) {
      await sendLeadCallbackRequestedNotification({
        lead,
        landingUrl: `${getBaseUrl(request)}/bewertung-ergebnis/${token}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
