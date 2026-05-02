import { BRAND_NAME, DIRECT_CONTACT, PHONE_DISPLAY } from "@/lib/site";
import type { LeadValuationRow } from "@/lib/immobilienbewertung/lead-records";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function greetingName(lead: LeadValuationRow) {
  const firstName = String(lead.first_name ?? "").trim();
  if (firstName) return firstName;

  const lastName = String(lead.last_name ?? "").trim();
  if (lastName) return lastName;

  const name = String(lead.name ?? "").trim();
  return name || null;
}

function greetingLine(lead: LeadValuationRow) {
  const name = greetingName(lead);
  return name ? `Hallo ${name},` : "Hallo,";
}

export function renderLeadValuationEmail(input: {
  lead: LeadValuationRow;
  landingUrl: string;
  contactImageUrl?: string | null;
}) {
  const { landingUrl } = input;
  const contactImageUrl = input.contactImageUrl || DIRECT_CONTACT.imagePath;
  const title = "Deine erste Werteinschätzung ist vorbereitet";
  const preheader = "Deine persönliche Ergebnisseite ist jetzt abrufbar.";
  const greeting = greetingLine(input.lead);
  const body = `
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
          <a href="${escapeHtml(
            landingUrl,
          )}" style="display:inline-block;background:#1b3040;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 22px;border-radius:6px;">
            Wertspanne jetzt ansehen
          </a>
        </p>

        <p style="margin:0 0 18px 0;">Die angezeigte Spanne gibt dir eine erste Orientierung.</p>
        <p style="margin:0 0 16px 0;">Der entscheidende Schritt ist jetzt die persönliche Einordnung:<br/>Wir prüfen die Einschätzung im Detail und sagen dir klar, welcher Verkaufspreis realistisch und am Markt durchsetzbar ist.</p>
        <p style="margin:0 0 10px 0;">So vermeidest du typische Fehler wie:</p>
        <p style="margin:0 0 22px 0;">
          – zu niedriger Verkaufspreis<br/>
          – lange Vermarktungsdauer<br/>
          – unnötige Unsicherheit
        </p>
        <p style="margin:0 0 28px 0;">Gerne übernehme ich diese Prüfung direkt für dich.</p>

        <p style="margin:0 0 18px 0;color:#1b3040;">Viele Grüße</p>
        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0;">
          <tr>
            <td style="width:116px;vertical-align:top;padding:0 22px 0 6px;">
              <img src="${escapeHtml(
                contactImageUrl,
              )}" width="116" alt="${escapeHtml(DIRECT_CONTACT.name)}" style="display:block;width:116px;height:auto;border:0;outline:none;border-radius:8px;">
            </td>
            <td style="vertical-align:top;color:#1b3040;font-size:16px;line-height:1.55;">
              <strong>${escapeHtml(DIRECT_CONTACT.name)}</strong><br/>
              Immobilienmakler (IHK)<br/>
              DEKRA-zertifizierter Sachverständiger für Immobilienbewertung D1<br/><br/>
              <strong>Frisia Immobilien</strong><br/>
              Telefon: ${escapeHtml(PHONE_DISPLAY)}
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>`;

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
    landingUrl,
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

  return {
    subject: title,
    preheader,
    html: body,
    text,
  };
}
