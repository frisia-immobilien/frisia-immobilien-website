import { BRAND_NAME, DIRECT_CONTACT, LEGAL_NAME, SITE_URL } from "@/lib/site";
import type { LeadValuationRow } from "@/lib/immobilienbewertung/lead-records";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function greeting(lead: LeadValuationRow) {
  if (lead.salutation === "mrs" && lead.last_name) return `Sehr geehrte Frau ${lead.last_name},`;
  if (lead.salutation === "mr" && lead.last_name) return `Sehr geehrter Herr ${lead.last_name},`;
  if (lead.first_name) return `Guten Tag ${lead.first_name},`;
  return "Guten Tag,";
}

export function renderLeadValuationEmail(input: {
  lead: LeadValuationRow;
  landingUrl: string;
}) {
  const { lead, landingUrl } = input;
  const title = "Ihre marktbasierte Einordnung von Frisia Immobilien";
  const preheader = `Ihre marktbasierte Einordnung ist bereit: ${lead.value_mid.toLocaleString("de-DE")} €`;
  const body = `
  <div style="background:#f4f6f9;padding:28px 16px;font-family:Arial,Helvetica,sans-serif;color:#243746;">
    <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e3e8ef;border-radius:28px;overflow:hidden;">
      <div style="padding:26px 32px;border-bottom:1px solid #edf1f5;background:#fbfcfd;">
        <div style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:#50616e;">${escapeHtml(
          BRAND_NAME,
        )}</div>
        <div style="margin-top:10px;font-size:28px;line-height:1.2;color:#1b3040;font-family:Georgia,'Times New Roman',serif;">Ihre marktbasierte Einordnung ist bereit</div>
        <div style="margin-top:8px;font-size:16px;line-height:1.55;color:#5a6a76;">Öffnen Sie Ihre persönliche Bewertungsseite im Browser. Dort finden Sie Preis, Spanne und die nächsten sinnvollen Schritte kompakt aufbereitet.</div>
      </div>

      <div style="padding:36px 32px;">
        <p style="margin:0 0 20px 0;font-size:18px;line-height:1.6;">${escapeHtml(greeting(lead))}</p>
        <p style="margin:0 0 24px 0;font-size:17px;line-height:1.7;color:#465762;">
          vielen Dank für Ihre Anfrage. Ihre erste marktbasierte Einordnung ist jetzt online verfügbar.
        </p>

        <div style="border:1px solid #e3e8ef;border-radius:24px;padding:28px 24px;background:#fbfcfd;text-align:center;">
          <div style="font-size:16px;color:#5a6a76;">Marktbasierte Einordnung</div>
          <div style="margin-top:12px;font-size:42px;line-height:1.08;color:#1b3040;font-weight:700;">${lead.value_mid.toLocaleString(
            "de-DE",
          )} €</div>
          <div style="margin-top:14px;font-size:18px;color:#334853;">Realistische Verkaufsspanne: ${lead.value_min.toLocaleString(
            "de-DE",
          )} € – ${lead.value_max.toLocaleString("de-DE")} €</div>
          <div style="margin-top:10px;font-size:14px;color:#6a7883;">Erste marktbasierte Einordnung auf Basis regionaler Vergleichsdaten.</div>
        </div>

        <div style="margin-top:28px;text-align:center;">
          <a href="${escapeHtml(
            landingUrl,
          )}" style="display:inline-block;background:#1b3040;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:15px 26px;border-radius:16px;">
            Jetzt Bewertung ansehen
          </a>
        </div>

        <p style="margin:28px 0 0 0;font-size:17px;line-height:1.7;color:#465762;">
          Den genauen Verkaufspreis legen wir gemeinsam strukturiert fest. Wenn Sie möchten, besprechen wir die Einordnung telefonisch oder bei einem Vor-Ort-Termin.
        </p>

        <div style="margin-top:26px;padding-top:26px;border-top:1px solid #edf1f5;">
          <div style="font-size:15px;line-height:1.7;color:#5f6d79;">
            <strong style="color:#1b3040;">${escapeHtml(DIRECT_CONTACT.name)}</strong><br/>
            ${escapeHtml(DIRECT_CONTACT.role)}<br/>
            Telefon: ${escapeHtml(DIRECT_CONTACT.phoneDisplay)}<br/>
            Mobil: ${escapeHtml(DIRECT_CONTACT.mobileDisplay)}<br/>
            E-Mail: ${escapeHtml(DIRECT_CONTACT.email)}
          </div>
        </div>
      </div>

      <div style="padding:22px 32px;border-top:1px solid #edf1f5;background:#fbfcfd;">
        <div style="font-size:13px;line-height:1.7;color:#6a7883;">
          Diese Einwertung stellt eine erste automatisierte Orientierung dar. Der tatsächliche Marktpreis hängt unter anderem von Zustand, Mikrolage und aktueller Nachfrage ab und wird im Rahmen einer persönlichen Bewertung präzise ermittelt.
        </div>
        <div style="margin-top:12px;font-size:12px;line-height:1.7;color:#7a8792;">
          ${escapeHtml(LEGAL_NAME)} · ${escapeHtml(SITE_URL)}
        </div>
      </div>
    </div>
  </div>`;

  const text = [
    title,
    "",
    greeting(lead),
    "",
    "Ihre marktbasierte Einordnung ist jetzt online verfügbar.",
    "",
    `Marktbasierte Einordnung: ${lead.value_mid.toLocaleString("de-DE")} €`,
    `Realistische Verkaufsspanne: ${lead.value_min.toLocaleString("de-DE")} € – ${lead.value_max.toLocaleString("de-DE")} €`,
    "Erste marktbasierte Einordnung auf Basis regionaler Vergleichsdaten.",
    "",
    `Bewertung ansehen: ${landingUrl}`,
    "",
    "Den genauen Verkaufspreis legen wir gemeinsam strukturiert fest.",
    "",
    `${DIRECT_CONTACT.name}`,
    `${DIRECT_CONTACT.role}`,
    `${DIRECT_CONTACT.phoneDisplay}`,
    `${DIRECT_CONTACT.email}`,
  ].join("\n");

  return {
    subject: title,
    preheader,
    html: body,
    text,
  };
}
