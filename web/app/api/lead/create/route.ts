import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { makeToken, hashToken, expiresAtDays } from "@/lib/tokens";
import { Resend } from "resend";

export const runtime = "nodejs";

type LeadType = "house" | "apartment" | "land";
type LeadCreateBody = {
  type?: LeadType;
  plz?: string;
  living_area?: number | string | null;
  livingArea?: number | string | null;
  land_area?: number | string | null;
  landArea?: number | string | null;
  email?: string;
  name?: string;
  phone?: string;
};

function getBaseUrl(req: Request) {
  // Lokal & Vercel zuverlässig (ohne PUBLIC_BASE_URL-Zwang)
  const proto = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

function money(n: number) {
  return n.toLocaleString("de-DE") + " €";
}

function typeLabel(t: string) {
  if (t === "house") return "Haus";
  if (t === "apartment") return "Wohnung";
  if (t === "land") return "Grundstück";
  return t;
}

export async function POST(req: Request) {
  try {
    // --- ENV prüfen (harte Fehler, damit du sofort weißt, was fehlt)
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, error: "RESEND_API_KEY fehlt in web/.env.local" },
        { status: 500 }
      );
    }
    if (!process.env.LEAD_FROM_EMAIL) {
      return NextResponse.json(
        { success: false, error: "LEAD_FROM_EMAIL fehlt in web/.env.local" },
        { status: 500 }
      );
    }
    if (!process.env.LEAD_TO_EMAIL) {
      return NextResponse.json(
        { success: false, error: "LEAD_TO_EMAIL fehlt in web/.env.local" },
        { status: 500 }
      );
    }
    if (!process.env.TOKEN_SECRET) {
      return NextResponse.json(
        { success: false, error: "TOKEN_SECRET fehlt in web/.env.local" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as LeadCreateBody;

    // akzeptiert snake_case UND camelCase (robust)
    const type = body.type;
    const plz: string = String(body.plz || "").trim();

    const living_area = body.living_area ?? body.livingArea ?? null;
    const land_area = body.land_area ?? body.landArea ?? null;

    const email: string = String(body.email || "").trim().toLowerCase();
    const name: string | null = body.name ? String(body.name).trim() : null;
    const phone: string | null = body.phone ? String(body.phone).trim() : null;

    if (!type || !["house", "apartment", "land"].includes(type)) {
      return NextResponse.json({ success: false, error: "Ungültiger Typ" }, { status: 400 });
    }
    if (!/^\d{5}$/.test(plz)) {
      return NextResponse.json({ success: false, error: "PLZ ungültig" }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "E-Mail ungültig" }, { status: 400 });
    }

    // 1) PLZ-Median holen
    const median = await sql`
      SELECT house_eur_m2, apartment_eur_m2, land_eur_m2
      FROM plz_medians
      WHERE plz = ${plz}
      LIMIT 1
    `;

    if (median.length === 0) {
      // gewünscht: Hinweis Einzugsgebiet
      return NextResponse.json(
        {
          success: false,
          error:
            "Sie befinden sich außerhalb unseres Einzugsgebietes. Wir melden uns trotzdem kurzfristig.",
        },
        { status: 400 }
      );
    }

    // 2) Basiswert berechnen
    let eur_m2 = 0;
    if (type === "house") eur_m2 = Number(median[0].house_eur_m2);
    if (type === "apartment") eur_m2 = Number(median[0].apartment_eur_m2);
    if (type === "land") eur_m2 = Number(median[0].land_eur_m2);

    const base_area = type === "land" ? Number(land_area || 0) : Number(living_area || 0);
    if (!base_area || base_area <= 0) {
      return NextResponse.json(
        { success: false, error: "Fläche fehlt oder ist 0" },
        { status: 400 }
      );
    }

    const mid = Math.round(eur_m2 * base_area);
    const min = Math.round(mid * 0.9);
    const max = Math.round(mid * 1.1);

    // 3) Token + DB speichern
    const token = makeToken();
    const tokenHash = hashToken(token, process.env.TOKEN_SECRET);
    const expiresAt = expiresAtDays(Number(process.env.TOKEN_TTL_DAYS || 30));

    await sql`
      INSERT INTO leads (
        token_hash, expires_at,
        type, plz, living_area, land_area,
        email, name, phone,
        value_min, value_mid, value_max
      )
      VALUES (
        ${tokenHash}, ${expiresAt},
        ${type}, ${plz}, ${living_area}, ${land_area},
        ${email}, ${name}, ${phone},
        ${min}, ${mid}, ${max}
      )
    `;

    const baseUrl = process.env.PUBLIC_BASE_URL || getBaseUrl(req);
    const link = `${baseUrl}/bewertung/${token}`;

    // 4) E-Mails senden
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Kunde
    await resend.emails.send({
      from: process.env.LEAD_FROM_EMAIL,
      to: email,
      subject: "Ihre Immobilien-Schnellbewertung",
      html: `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial; line-height:1.5; color:#0f172a;">
          <p>Guten Tag${name ? " " + name : ""},</p>

          <p>
            vielen Dank für Ihre Anfrage. Ihre <strong>unverbindliche Immobilien-Schnellbewertung</strong> ist bereit.
          </p>

          <p style="margin:16px 0;">
            <a href="${link}" style="display:inline-block; background:#1B3040; color:#fff; padding:12px 16px; border-radius:12px; text-decoration:none; font-weight:700;">
              Bewertung ansehen
            </a>
          </p>

          <p style="margin:16px 0; padding:12px 14px; border:1px solid #e2e8f0; border-radius:12px; background:#f8fafc;">
            <strong>Orientierungswert (Ø):</strong> ${money(mid)}<br/>
            <span style="color:#475569;">Spanne: ${money(min)} – ${money(max)}</span>
          </p>

          <p style="color:#475569;">
            Hinweis: Der Wert dient als erste Orientierung auf Basis regionaler Vergleichspreise und Ihrer Angaben.
          </p>

          <p>
            Freundliche Grüße<br/>
            <strong>Frisia Immobilien</strong>
          </p>
        </div>
      `,
    });

    // Du / internes Lead-Mail
    await resend.emails.send({
      from: process.env.LEAD_FROM_EMAIL,
      to: process.env.LEAD_TO_EMAIL,
      subject: `Neuer Bewertungs-Lead – ${typeLabel(type)} ${plz} – Ø ${money(mid)}`,
      html: `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial; line-height:1.5; color:#0f172a;">
          <p><strong>Neuer Lead (Immobilienbewertung)</strong></p>
          <ul>
            <li><strong>E-Mail:</strong> ${email}</li>
            ${phone ? `<li><strong>Telefon:</strong> ${phone}</li>` : ""}
            ${name ? `<li><strong>Name:</strong> ${name}</li>` : ""}
            <li><strong>Typ:</strong> ${typeLabel(type)}</li>
            <li><strong>PLZ:</strong> ${plz}</li>
            ${living_area ? `<li><strong>Wohnfläche:</strong> ${living_area} m²</li>` : ""}
            ${land_area ? `<li><strong>Grundstück:</strong> ${land_area} m²</li>` : ""}
            <li><strong>Ø Wert:</strong> ${money(mid)} (Spanne ${money(min)} – ${money(max)})</li>
          </ul>

          <p>
            <a href="${link}">Bewertung öffnen</a>
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      value: { min, mid, max },
      link,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
