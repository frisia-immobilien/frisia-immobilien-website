import "server-only";

import { Resend } from "resend";

import type { LeadValuationRow } from "@/lib/immobilienbewertung/lead-records";
import { renderLeadValuationEmail } from "@/lib/immobilienbewertung/templates/valuation-email";
import { getBrokerAvatarUrlByEmail } from "@/lib/propstack/client";
import { DIRECT_CONTACT } from "@/lib/site";

export type SentLeadMail = {
  provider: "resend";
  messageId: string | null;
};

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY fehlt.");
  }

  return new Resend(process.env.RESEND_API_KEY);
}

function requireMailConfig() {
  if (!process.env.LEAD_FROM_EMAIL) {
    throw new Error("LEAD_FROM_EMAIL fehlt.");
  }
  if (!process.env.LEAD_TO_EMAIL) {
    throw new Error("LEAD_TO_EMAIL fehlt.");
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendLeadValuationEmails(input: {
  lead: LeadValuationRow;
  landingUrl: string;
}) : Promise<SentLeadMail> {
  requireMailConfig();
  const resend = getResendClient();

  const contactImageUrl =
    (await getBrokerAvatarUrlByEmail(DIRECT_CONTACT.email).catch(() => null)) || DIRECT_CONTACT.imagePath;
  const customerTemplate = renderLeadValuationEmail({ ...input, contactImageUrl });
  const customerResponse = await resend.emails.send({
    from: process.env.LEAD_FROM_EMAIL!,
    to: input.lead.email,
    subject: customerTemplate.subject,
    html: customerTemplate.html,
    text: customerTemplate.text,
  });

  const internalSubject = `Immobilienbewertung versendet – ${input.lead.name || input.lead.email} – ${input.lead.value_mid.toLocaleString("de-DE")} €`;
  await resend.emails.send({
    from: process.env.LEAD_FROM_EMAIL!,
    to: process.env.LEAD_TO_EMAIL!,
    subject: internalSubject,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#243746;">
        <h2 style="margin:0 0 16px 0;color:#1B3040;">Immobilienbewertung versendet</h2>
        <p><strong>Name:</strong> ${input.lead.name || "k. A."}</p>
        <p><strong>E-Mail:</strong> ${input.lead.email}</p>
        <p><strong>Telefon:</strong> ${input.lead.phone || "k. A."}</p>
        <p><strong>Objekt:</strong> ${input.lead.location_text || "k. A."}</p>
        <p><strong>Marktbasierte Einordnung:</strong> ${input.lead.value_mid.toLocaleString("de-DE")} €</p>
        <p><strong>Spanne:</strong> ${input.lead.value_min.toLocaleString("de-DE")} € – ${input.lead.value_max.toLocaleString("de-DE")} €</p>
        <p><strong>Landingpage:</strong> <a href="${input.landingUrl}">${input.landingUrl}</a></p>
      </div>
    `,
  });

  return {
    provider: "resend",
    messageId: customerResponse.data?.id ?? null,
  };
}

export async function sendLeadCallbackRequestedNotification(input: {
  lead: LeadValuationRow;
  landingUrl: string;
}) {
  requireMailConfig();
  const resend = getResendClient();

  await resend.emails.send({
    from: process.env.LEAD_FROM_EMAIL!,
    to: process.env.LEAD_TO_EMAIL!,
    subject: `Immobilienbewertung Rückrufwunsch – ${input.lead.name || input.lead.email}`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#243746;">
        <h2 style="margin:0 0 16px 0;color:#1B3040;">Immobilienbewertung Rückrufwunsch</h2>
        <p><strong>Name:</strong> ${escapeHtml(input.lead.name || "k. A.")}</p>
        <p><strong>E-Mail:</strong> ${escapeHtml(input.lead.email)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(input.lead.phone || "k. A.")}</p>
        <p><strong>Objekt:</strong> ${escapeHtml(input.lead.location_text || "k. A.")}</p>
        <p><strong>Bewertung:</strong> ${input.lead.value_mid.toLocaleString("de-DE")} €</p>
        <p><strong>Landingpage:</strong> <a href="${escapeHtml(input.landingUrl)}">${escapeHtml(input.landingUrl)}</a></p>
      </div>
    `,
    text: [
      "Immobilienbewertung Rückrufwunsch",
      "",
      `Name: ${input.lead.name || "k. A."}`,
      `E-Mail: ${input.lead.email}`,
      `Telefon: ${input.lead.phone || "k. A."}`,
      `Objekt: ${input.lead.location_text || "k. A."}`,
      `Bewertung: ${input.lead.value_mid.toLocaleString("de-DE")} €`,
      `Landingpage: ${input.landingUrl}`,
    ].join("\n"),
  });
}
