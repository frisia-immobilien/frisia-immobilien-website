import "server-only";

import {
  getBrokerAvatarUrlByEmail,
  sendPropstackMessage,
} from "@/lib/propstack/client";
import { absoluteUrl, BRAND_NAME, DIRECT_CONTACT, EMAIL, PHONE_DISPLAY, SITE_URL } from "@/lib/site";
import type { LeadReportWithRequest } from "@/lib/types/leadgen";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function publicReportUrl(reportUrl: string) {
  try {
    const url = new URL(reportUrl);
    if (
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "0.0.0.0" ||
      url.hostname.endsWith(".local")
    ) {
      return `${SITE_URL}${url.pathname}${url.search}${url.hash}`;
    }
    return url.toString();
  } catch {
    return absoluteUrl(reportUrl);
  }
}

function emailTrackingUrl(reportUrl: string) {
  try {
    const url = new URL(publicReportUrl(reportUrl));
    url.searchParams.set("utm_source", "email");
    url.searchParams.set("utm_medium", "leadgenerator");
    url.searchParams.set("utm_campaign", "marktwerteinschaetzung");
    return url.toString();
  } catch {
    const separator = reportUrl.includes("?") ? "&" : "?";
    return `${reportUrl}${separator}utm_source=email&utm_medium=leadgenerator&utm_campaign=marktwerteinschaetzung`;
  }
}

function greetingName(input: { firstname?: string | null; lastname?: string | null }) {
  const firstName = String(input.firstname ?? "").trim();
  if (firstName) return firstName;

  const lastName = String(input.lastname ?? "").trim();
  return lastName || null;
}

function greetingLine(input: { firstname?: string | null; lastname?: string | null }) {
  const name = greetingName(input);
  return name ? `Hallo ${name},` : "Hallo,";
}

export function renderReportEmail(
  lead: LeadReportWithRequest,
  reportUrl: string,
  contactImageUrl: string = DIRECT_CONTACT.imagePath,
) {
  const trackedUrl = emailTrackingUrl(reportUrl);
  const safeUrl = escapeHtml(trackedUrl);
  const subject = "Deine Werteinschätzung ist fertig";
  const greeting = greetingLine(lead.lead_request);
  const text = [
    BRAND_NAME.toUpperCase(),
    "",
    "Deine erste Werteinschätzung ist vorbereitet.",
    "",
    greeting,
    "",
    "vielen Dank für deine Angaben.",
    "",
    "Deine persönliche Ergebnisseite ist jetzt abrufbar. Dort siehst du die aktuelle Wertspanne deiner Immobilie – übersichtlich und nachvollziehbar dargestellt.",
    "",
    "Wertspanne jetzt ansehen",
    trackedUrl,
    "",
    "Die angezeigte Spanne gibt dir eine erste Orientierung.",
    "",
    "Der entscheidende Schritt ist jetzt die persönliche Einordnung:",
    "Wir prüfen die Einschätzung im Detail und sagen dir klar, welcher Verkaufspreis realistisch und am Markt durchsetzbar ist.",
    "",
    "So vermeidest du typische Fehler wie:",
    "– zu niedriger Verkaufspreis",
    "– lange Vermarktungsdauer",
    "– unnötige Unsicherheit",
    "",
    "Gerne übernehme ich diese Prüfung direkt für dich.",
    "",
    "Viele Grüße",
    "",
    DIRECT_CONTACT.name,
    "Immobilienmakler (IHK)",
    "DEKRA-zertifizierter Sachverständiger für Immobilienbewertung D1",
    "",
    "Frisia Immobilien",
    `Telefon: ${PHONE_DISPLAY}`,
  ].join("\n");

  const html = `
    <div style="background:#f4f6f9;padding:28px 16px;font-family:Arial,Helvetica,sans-serif;color:#1b3040;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e3e8ef;border-radius:18px;overflow:hidden;">
        <div style="padding:30px 34px 10px 34px;">
          <div style="font-size:13px;letter-spacing:0.16em;text-transform:uppercase;font-weight:700;color:#3f535d;">${escapeHtml(
            BRAND_NAME.toUpperCase(),
          )}</div>
          <h1 style="margin:18px 0 0 0;font-size:30px;line-height:1.18;color:#1b3040;font-family:Georgia,'Times New Roman',serif;font-weight:700;">Deine erste Werteinschätzung ist vorbereitet.</h1>
        </div>

        <div style="padding:22px 34px 34px 34px;font-size:16px;line-height:1.72;color:#465762;">
          <p style="margin:0 0 18px 0;color:#1b3040;">${escapeHtml(greeting)}</p>
          <p style="margin:0 0 18px 0;">vielen Dank für deine Angaben.</p>
          <p style="margin:0 0 22px 0;">Deine persönliche Ergebnisseite ist jetzt abrufbar. Dort siehst du die aktuelle Wertspanne deiner Immobilie – übersichtlich und nachvollziehbar dargestellt.</p>

          <p style="margin:28px 0 30px 0;">
            <a href="${safeUrl}" style="display:inline-block;background:#1b3040;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 22px;border-radius:6px;">
              Wertspanne jetzt ansehen
            </a>
          </p>

          <p style="margin:0 0 18px 0;">Die angezeigte Spanne gibt dir eine erste Orientierung.</p>
          <p style="margin:0 0 16px 0;">Der entscheidende Schritt ist jetzt die persönliche Einordnung:<br>Wir prüfen die Einschätzung im Detail und sagen dir klar, welcher Verkaufspreis realistisch und am Markt durchsetzbar ist.</p>
          <p style="margin:0 0 10px 0;">So vermeidest du typische Fehler wie:</p>
          <p style="margin:0 0 22px 0;">
            – zu niedriger Verkaufspreis<br>
            – lange Vermarktungsdauer<br>
            – unnötige Unsicherheit
          </p>
          <p style="margin:0 0 28px 0;">Gerne übernehme ich diese Prüfung direkt für dich.</p>

          <p style="margin:0 0 18px 0;color:#1b3040;">Viele Grüße</p>
          <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0;">
            <tr>
              <td style="width:116px;vertical-align:top;padding:0 22px 0 6px;">
                <img src="${escapeHtml(contactImageUrl)}" width="116" alt="${escapeHtml(
                  DIRECT_CONTACT.name,
                )}" style="display:block;width:116px;height:auto;border:0;outline:none;border-radius:8px;">
              </td>
              <td style="vertical-align:top;color:#1b3040;font-size:16px;line-height:1.55;">
                <strong>${escapeHtml(DIRECT_CONTACT.name)}</strong><br>
                Immobilienmakler (IHK)<br>
                DEKRA-zertifizierter Sachverständiger für Immobilienbewertung D1<br><br>
                <strong>Frisia Immobilien</strong><br>
                Telefon: ${escapeHtml(PHONE_DISPLAY)}
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}

async function sendPropstackReportEmail(input: {
  lead: LeadReportWithRequest;
  to: string;
  subject: string;
  html: string;
}) {
  return sendPropstackMessage({
    to: input.to,
    subject: input.subject,
    html: input.html,
    contactId: input.lead.lead_request.propstack_contact_id,
    propertyId: input.lead.lead_request.propstack_property_id,
    assignedBrokerEmail: EMAIL,
  });
}

export async function sendReportLink(input: {
  lead: LeadReportWithRequest;
  reportUrl: string;
}) {
  const email = input.lead.lead_request.email;
  if (!email) throw new Error("Lead hat keine E-Mail-Adresse.");

  const contactImageUrl =
    (await getBrokerAvatarUrlByEmail(DIRECT_CONTACT.email).catch(() => null)) || DIRECT_CONTACT.imagePath;
  const rendered = renderReportEmail(input.lead, input.reportUrl, contactImageUrl);

  try {
    const messageId = await sendPropstackReportEmail({
      lead: input.lead,
      to: email,
      subject: rendered.subject,
      html: rendered.html,
    });

    return { provider: "propstack_message" as const, messageId };
  } catch (error) {
    const propstackErrorMessage = error instanceof Error ? error.message : String(error);

    return { provider: "failed" as const, messageId: null, error: propstackErrorMessage };
  }
}
