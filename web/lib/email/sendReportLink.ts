import "server-only";

import { Resend } from "resend";

import {
  createNote,
  createTask,
  getBrokerAvatarUrlByEmail,
} from "@/lib/propstack/client";
import { absoluteUrl, BRAND_NAME, DIRECT_CONTACT, PHONE_DISPLAY, SITE_URL } from "@/lib/site";
import type { LeadReportWithRequest } from "@/lib/types/leadgen";

const RESEND_FALLBACK_FROM_EMAIL = "Frisia Immobilien <onboarding@resend.dev>";
const REPORT_FROM_EMAIL = "Frisia Immobilien <info@frisia-immobilien.de>";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY fehlt.");
  }

  return new Resend(process.env.RESEND_API_KEY);
}

function getReportFromEmail() {
  return process.env.REPORT_FROM_EMAIL?.trim() || REPORT_FROM_EMAIL;
}

function getResendFallbackFromEmail() {
  return process.env.RESEND_FALLBACK_FROM_EMAIL?.trim() || RESEND_FALLBACK_FROM_EMAIL;
}

function isUnverifiedResendDomainError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.toLowerCase().includes("domain is not verified");
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

async function sendResendReportEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const resend = getResendClient();
  const send = async (from: string) => {
    const response = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (response.error) {
      throw new Error(response.error.message || "Resend konnte die E-Mail nicht versenden.");
    }

    return response.data?.id ?? null;
  };

  const primaryFrom = getReportFromEmail();
  try {
    return await send(primaryFrom);
  } catch (error) {
    const fallbackFrom = getResendFallbackFromEmail();
    if (!isUnverifiedResendDomainError(error) || fallbackFrom === primaryFrom) {
      throw error;
    }

    return send(fallbackFrom);
  }
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
    const messageId = await sendResendReportEmail({
      to: email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    await createNote({
      title: "Bewertungslink per E-Mail versendet",
      body: [
        "Der Bewertungslink wurde per Resend an den Eigentümer versendet.",
        "",
        `Empfänger: ${email}`,
        `Betreff: ${rendered.subject}`,
        messageId ? `Resend Message-ID: ${messageId}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      contactId: input.lead.lead_request.propstack_contact_id,
      propertyId: input.lead.lead_request.propstack_property_id,
    }).catch(() => null);

    return { provider: "resend" as const, messageId };
  } catch (error) {
    const resendErrorMessage = error instanceof Error ? error.message : String(error);

    const body = [
      "Resend konnte den Bewertungslink nicht automatisch versenden.",
      "",
      "Bitte folgende E-Mail aus Propstack an den Kontakt senden:",
      "",
      `Betreff: ${rendered.subject}`,
      "",
      rendered.text,
      "",
      `Technischer Hinweis Resend: ${resendErrorMessage}`,
    ].join("\n");

    try {
      await createNote({
        title: "Bewertungslink E-Mail vorbereiten",
        body,
        contactId: input.lead.lead_request.propstack_contact_id,
        propertyId: input.lead.lead_request.propstack_property_id,
      });

      await createTask({
        title: "Bewertungslink an Eigentümer senden",
        body,
        contactId: input.lead.lead_request.propstack_contact_id,
        propertyId: input.lead.lead_request.propstack_property_id,
      });

      return { provider: "propstack_task" as const, messageId: null };
    } catch {
      return { provider: "failed" as const, messageId: null };
    }
  }
}
