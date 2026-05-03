import { NextResponse } from "next/server";

import { sendReportLink } from "@/lib/email/sendReportLink";
import { getPublicApiErrorMessage } from "@/lib/api/publicError";
import {
  createLeadReportCopyWithToken,
  getLatestLeadReportByLeadId,
  insertLeadEvent,
  updateLeadStatus,
} from "@/lib/leadgen/repository";
import { createRandomToken, getReportExpiryDate } from "@/lib/security/hashToken";
import { assertRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { absoluteUrl } from "@/lib/site";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertRateLimit(`lead:resend-report:${getClientIp(request)}`, 5);

    const body = (await request.json()) as { leadId?: unknown };
    const leadId = String(body.leadId ?? "").trim();
    if (!leadId) {
      return NextResponse.json({ success: false, error: "Lead-ID fehlt." }, { status: 400 });
    }

    const latestReport = await getLatestLeadReportByLeadId(leadId);
    if (!latestReport) {
      return NextResponse.json(
        { success: false, error: "Es wurde noch keine Werteinschätzung gefunden." },
        { status: 404 },
      );
    }

    if (!latestReport.lead_request.email) {
      return NextResponse.json(
        { success: false, error: "Für diesen Lead ist keine E-Mail-Adresse hinterlegt." },
        { status: 400 },
      );
    }

    const token = createRandomToken();
    const expiresAt = getReportExpiryDate();
    const report = await createLeadReportCopyWithToken({
      sourceReport: latestReport,
      token,
      expiresAt,
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Die E-Mail konnte nicht vorbereitet werden." },
        { status: 500 },
      );
    }

    const reportUrl = absoluteUrl(`/bewertung-ergebnis/${token}`);
    const sent = await sendReportLink({ lead: report, reportUrl });
    const emailWasSent = sent.provider === "propstack_message";

    await updateLeadStatus(leadId, emailWasSent ? "report_sent" : "valuation_calculated");
    if (emailWasSent) {
      await insertLeadEvent({
        leadRequestId: leadId,
        eventName: "email_sent",
        payload: { provider: sent.provider, messageId: sent.messageId },
      });
    }

    return NextResponse.json({
      success: emailWasSent,
      email: report.lead_request.email,
      provider: sent.provider,
      error: emailWasSent ? undefined : "E-Mail konnte nicht automatisch gesendet werden.",
    });
  } catch (error) {
    const retryAfter = (error as Error & { retryAfterSeconds?: number }).retryAfterSeconds;
    return NextResponse.json(
      {
        success: false,
        error: getPublicApiErrorMessage(error, "E-Mail konnte nicht erneut gesendet werden."),
      },
      { status: retryAfter ? 429 : 500, headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined },
    );
  }
}
