import "server-only";

import type { LeadValuationRow } from "@/lib/immobilienbewertung/lead-records";
import { renderLeadValuationEmail } from "@/lib/immobilienbewertung/templates/valuation-email";
import { getBrokerAvatarUrlByEmail, sendPropstackMessage } from "@/lib/propstack/client";
import { DIRECT_CONTACT, EMAIL } from "@/lib/site";

export type SentLeadMail = {
  provider: "propstack_message";
  messageId: number | null;
};

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
  const contactImageUrl =
    (await getBrokerAvatarUrlByEmail(DIRECT_CONTACT.email).catch(() => null)) || DIRECT_CONTACT.imagePath;
  const customerTemplate = renderLeadValuationEmail({ ...input, contactImageUrl });
  const messageId = await sendPropstackMessage({
    to: input.lead.email,
    assignedBrokerEmail: EMAIL,
    subject: customerTemplate.subject,
    html: customerTemplate.html,
  });

  const internalSubject = `Immobilienbewertung versendet – ${input.lead.name || input.lead.email} – ${input.lead.value_mid.toLocaleString("de-DE")} €`;
  await sendPropstackMessage({
    to: EMAIL,
    assignedBrokerEmail: EMAIL,
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
    provider: "propstack_message",
    messageId,
  };
}

export async function sendLeadCallbackRequestedNotification(input: {
  lead: LeadValuationRow;
  landingUrl: string;
}) {
  await sendPropstackMessage({
    to: EMAIL,
    assignedBrokerEmail: EMAIL,
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
  });
}
