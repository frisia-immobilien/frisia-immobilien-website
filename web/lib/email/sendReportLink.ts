import "server-only";

import { createNote, createTask, sendPropstackMessage } from "@/lib/propstack/client";
import type { LeadReportWithRequest } from "@/lib/types/leadgen";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function nameFor(lead: LeadReportWithRequest) {
  const first = lead.lead_request.firstname?.trim();
  const last = lead.lead_request.lastname?.trim();
  const full = [first, last].filter(Boolean).join(" ");
  return full || "Interessent/in";
}

export function renderReportEmail(lead: LeadReportWithRequest, reportUrl: string) {
  const name = escapeHtml(nameFor(lead));
  const safeUrl = escapeHtml(reportUrl);
  const subject = "Deine Immobilienbewertung ist bereit";
  const text = [
    `Sehr geehrte/r ${name},`,
    "",
    "vielen Dank für Ihre Anfrage.",
    "",
    "Auf Grundlage Ihrer Angaben haben wir eine erste Marktpreiseinschätzung für Ihre Immobilie erstellt.",
    "",
    `Sie können Ihre persönliche Einschätzung hier ansehen: ${reportUrl}`,
    "",
    "Der Link ist 30 Tage gültig.",
    "",
    "Bitte beachten Sie: Diese Einschätzung basiert auf statistischen Vergleichsdaten und Ihren Eingaben. Sie ersetzt keine persönliche Bewertung vor Ort. Lage, Zustand, Ausstattung und besondere Merkmale können den tatsächlichen Verkaufspreis beeinflussen.",
    "",
    "Gerne ordnen wir das Ergebnis persönlich mit Ihnen ein und zeigen Ihnen, welcher Verkaufspreis realistisch erreichbar ist.",
    "",
    "Viele Grüße",
    "Sebastian Munzig",
    "Frisia Immobilien",
    "04941 986770-0",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.65;color:#1B3040;">
      <p>Sehr geehrte/r ${name},</p>
      <p>vielen Dank für Ihre Anfrage.</p>
      <p>Auf Grundlage Ihrer Angaben haben wir eine erste Marktpreiseinschätzung für Ihre Immobilie erstellt.</p>
      <p style="margin:22px 0;">
        <a href="${safeUrl}" style="display:inline-block;background:#1B3040;color:#ffffff;padding:13px 18px;border-radius:8px;text-decoration:none;font-weight:700;">
          Bewertung öffnen
        </a>
      </p>
      <p>Der Link ist 30 Tage gültig.</p>
      <p><strong>Bitte beachten Sie:</strong> Diese Einschätzung basiert auf statistischen Vergleichsdaten und Ihren Eingaben. Sie ersetzt keine persönliche Bewertung vor Ort. Lage, Zustand, Ausstattung und besondere Merkmale können den tatsächlichen Verkaufspreis beeinflussen.</p>
      <p>Gerne ordnen wir das Ergebnis persönlich mit Ihnen ein und zeigen Ihnen, welcher Verkaufspreis realistisch erreichbar ist.</p>
      <p>Viele Grüße<br>Sebastian Munzig<br>Frisia Immobilien<br>04941 986770-0</p>
    </div>
  `;

  return { subject, text, html };
}

export async function sendReportLink(input: {
  lead: LeadReportWithRequest;
  reportUrl: string;
}) {
  const email = input.lead.lead_request.email;
  if (!email) throw new Error("Lead hat keine E-Mail-Adresse.");

  const rendered = renderReportEmail(input.lead, input.reportUrl);

  try {
    const messageId = await sendPropstackMessage({
      to: email,
      subject: rendered.subject,
      html: rendered.html,
      contactId: input.lead.lead_request.propstack_contact_id,
      propertyId: input.lead.lead_request.propstack_property_id,
    });

    return { provider: "propstack" as const, messageId };
  } catch (error) {
    const body = [
      "Propstack E-Mail-Versand konnte nicht automatisch abgeschlossen werden.",
      "",
      "Bitte folgende E-Mail aus Propstack an den Kontakt senden:",
      "",
      `Betreff: ${rendered.subject}`,
      "",
      rendered.text,
      "",
      `Technischer Hinweis: ${error instanceof Error ? error.message : String(error)}`,
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
