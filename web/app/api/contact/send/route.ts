import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  syncContactFormToPropstack,
  type PropstackContactFormInput,
} from "@/lib/propstack-contact-form";

export const runtime = "nodejs";

type ContactBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
  originUrl?: string;
  captchaToken?: string;
  website?: string; // honeypot
};

function sanitize(v: unknown) {
  return String(v ?? "").trim();
}

function htmlEscape(v: string) {
  return v
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function verifyTurnstile(token: string, remoteIp?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;

  const formData = new URLSearchParams();
  formData.append("secret", secret);
  formData.append("response", token);
  if (remoteIp) formData.append("remoteip", remoteIp);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
    cache: "no-store",
  });

  if (!response.ok) return false;
  const data = (await response.json()) as { success?: boolean };
  return data.success === true;
}

async function sendContactNotification(input: PropstackContactFormInput) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const recipient = "info@frisia-immobilien.de";
  const fullName = `${input.firstName} ${input.lastName}`.trim();

  await resend.emails.send({
    from: process.env.LEAD_FROM_EMAIL!,
    to: recipient,
    subject: `Kontaktanfrage Website – ${fullName}`,
    replyTo: input.email,
    html: `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.6;color:#1f2937;">
        <h2 style="margin:0 0 12px 0;color:#1B3040;">Neue Kontaktanfrage</h2>
        <p><strong>Name:</strong> ${htmlEscape(fullName)}</p>
        <p><strong>E-Mail:</strong> ${htmlEscape(input.email)}</p>
        <p><strong>Telefon:</strong> ${htmlEscape(input.phone || "—")}</p>
        <p><strong>Quelle:</strong> Website Kontaktformular</p>
        <p><strong>Herkunfts-URL:</strong> ${htmlEscape(input.originUrl || "—")}</p>
        <p><strong>Nachricht:</strong></p>
        <p style="white-space:pre-wrap;border:1px solid #d1d5db;border-radius:10px;padding:12px;">${htmlEscape(input.message)}</p>
      </div>
    `,
  });
}

export async function POST(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: false, error: "RESEND_API_KEY fehlt." }, { status: 500 });
    }
    if (!process.env.LEAD_FROM_EMAIL) {
      return NextResponse.json({ success: false, error: "LEAD_FROM_EMAIL fehlt." }, { status: 500 });
    }

    const body = (await req.json()) as ContactBody;
    const firstName = sanitize(body.firstName);
    const lastName = sanitize(body.lastName);
    const email = sanitize(body.email).toLowerCase();
    const phone = sanitize(body.phone);
    const message = sanitize(body.message);
    const originUrl = sanitize(body.originUrl) || sanitize(req.headers.get("referer"));
    const captchaToken = sanitize(body.captchaToken);
    const website = sanitize(body.website);

    if (website) {
      return NextResponse.json({ success: true });
    }

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ success: false, error: "Bitte alle Pflichtfelder ausfüllen." }, { status: 400 });
    }
    if (!isEmail(email)) {
      return NextResponse.json({ success: false, error: "Bitte eine gültige E-Mail-Adresse eingeben." }, { status: 400 });
    }
    if (!captchaToken) {
      return NextResponse.json({ success: false, error: "Bitte Captcha bestätigen." }, { status: 400 });
    }

    const forwardedFor = req.headers.get("x-forwarded-for");
    const remoteIp = forwardedFor?.split(",")[0]?.trim();
    const captchaOk = await verifyTurnstile(captchaToken, remoteIp);
    if (!captchaOk) {
      return NextResponse.json({ success: false, error: "Captcha konnte nicht bestätigt werden." }, { status: 400 });
    }

    const contactInput: PropstackContactFormInput = {
      firstName,
      lastName,
      email,
      phone,
      message,
      originUrl,
    };

    await Promise.all([
      syncContactFormToPropstack(contactInput),
      sendContactNotification(contactInput),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Kontaktanfrage konnte nicht verarbeitet werden", error);
    return NextResponse.json({ success: false, error: "Serverfehler beim Versand." }, { status: 500 });
  }
}
