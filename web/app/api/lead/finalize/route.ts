import { NextResponse } from "next/server";

import {
  hasLeadSyncCaptureRequirements,
  hasLeadSyncLocation,
  normalizeLeadEmail,
  type LeadSyncPayload,
} from "@/lib/lead-sync";
import { calculateLeadReportForLead } from "@/lib/leadgen/calculateLeadReport";
import { mapLeadSyncPayloadToLeadPayload } from "@/lib/leadgen/leadSyncAdapter";
import {
  insertLeadEvent,
  updateLeadPropstackIds,
  upsertLeadRequest,
} from "@/lib/leadgen/repository";
import { leadCreateSchema } from "@/lib/leadgen/validation";
import { geocodeAddress } from "@/lib/market/geocodeAddress";
import { createOrUpdateContact, createOrUpdateProperty } from "@/lib/propstack/client";
import { hashPrivacyValue } from "@/lib/security/hashToken";
import { assertRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { isTurnstileTestKey, shouldBypassTurnstileForLocalDev } from "@/lib/turnstile";

export const runtime = "nodejs";

type LeadFinalizeBody = {
  leadId?: string | null;
  payload?: LeadSyncPayload;
  captchaToken?: string | null;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isLeadSyncPayload(value: unknown): value is LeadSyncPayload {
  return isObject(value);
}

function normalizeText(value: unknown) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : "";
}

function isValidEmail(value: unknown) {
  const email = normalizeLeadEmail(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(value: unknown) {
  const phone = normalizeText(value);
  if (!phone) return false;
  if (!/^[0-9+()\-/.\s]+$/.test(phone)) return false;
  return phone.replace(/\D/g, "").length >= 7;
}

function isFinitePositive(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
}

function isValidYear(value: unknown) {
  const year = Number(value);
  return Number.isFinite(year) && year >= 1600 && year <= new Date().getFullYear();
}

function hasAddress(value: {
  street?: string | null;
  house_number?: string | null;
  postal_code?: string | null;
  city?: string | null;
}) {
  return Boolean(value.street && value.house_number && value.postal_code && value.city);
}

async function verifyTurnstile(token: string, remoteIp?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;

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

function validateFinalizePayload(payload: LeadSyncPayload) {
  if (!payload.propertyType) return "Objektart fehlt.";
  if (!hasLeadSyncLocation(payload)) return "Für die Bewertung werden vollständige Adressdaten inklusive Hausnummer benötigt.";
  if (!isValidEmail(payload.email)) return "Bitte eine gültige E-Mail-Adresse angeben.";
  if (payload.consent !== true) return "Die Einwilligung zum Versand der Bewertung fehlt.";
  if (!normalizeText(payload.person?.firstName)) return "Vorname fehlt.";
  if (!normalizeText(payload.person?.lastName)) return "Nachname fehlt.";
  if (!isValidPhone(payload.person?.phone)) return "Bitte eine gültige Telefonnummer angeben.";

  if (payload.propertyType === "house" || payload.propertyType === "apartment") {
    if (!isFinitePositive(payload.facts?.livingArea)) return "Für die Bewertung wird eine gültige Wohnfläche benötigt.";
    if (!isValidYear(payload.facts?.yearBuilt)) return "Für die Bewertung wird ein gültiges Baujahr benötigt.";
  }

  if (payload.propertyType === "house") {
    if (!isFinitePositive(payload.facts?.landSize)) return "Für Häuser wird eine Grundstücksfläche benötigt.";
    if (!isFinitePositive(payload.facts?.rooms)) return "Für Häuser wird eine Zimmeranzahl benötigt.";
    if (!payload.facts?.reason || payload.facts.reason === "unknown") return "Bitte den Anlass der Bewertung angeben.";
    if (!payload.facts?.usage || payload.facts.usage === "unknown") return "Bitte die aktuelle Nutzung der Immobilie angeben.";
  }

  if (payload.propertyType === "apartment" && !isFinitePositive(payload.facts?.rooms)) {
    return "Für Wohnungen wird eine Zimmeranzahl benötigt.";
  }

  if (payload.propertyType === "land") {
    if (!isFinitePositive(payload.facts?.landSize)) return "Für Grundstücke wird eine Grundstücksfläche benötigt.";
    if (!payload.facts?.erschliessung) return "Bitte den Erschließungsstatus angeben.";
    if (!payload.facts?.bebaubarkeit) return "Bitte die Bebaubarkeit angeben.";
    if (!payload.facts?.bebauungsgebiet) return "Bitte das Bebauungsgebiet angeben.";
  }

  return null;
}

export async function POST(request: Request) {
  let leadId: string | null = null;

  try {
    const clientIp = getClientIp(request);
    assertRateLimit(`lead:finalize:${clientIp}`);

    const body = (await request.json()) as LeadFinalizeBody;

    if (!isLeadSyncPayload(body.payload)) {
      return NextResponse.json(
        { success: false, error: "Bewertungsdaten fehlen oder sind ungültig." },
        { status: 400 },
      );
    }

    const validationError = validateFinalizePayload(body.payload);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const captchaToken = normalizeText(body.captchaToken);
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY ?? "";
    const captchaBypassed = shouldBypassTurnstileForLocalDev(turnstileSecret);
    if (turnstileSecret && !captchaBypassed) {
      if (isTurnstileTestKey(turnstileSecret)) {
        return NextResponse.json(
          { success: false, error: "Sicherheitsprüfung ist nicht korrekt konfiguriert." },
          { status: 500 },
        );
      }

      if (!captchaToken) {
        return NextResponse.json(
          { success: false, error: "Bitte Sicherheitsprüfung bestätigen." },
          { status: 400 },
        );
      }

      const forwardedFor = request.headers.get("x-forwarded-for");
      const remoteIp = forwardedFor?.split(",")[0]?.trim();
      const captchaOk = await verifyTurnstile(captchaToken, remoteIp);
      if (!captchaOk) {
        return NextResponse.json(
          { success: false, error: "Sicherheitsprüfung konnte nicht bestätigt werden." },
          { status: 400 },
        );
      }
    }

    if (!hasLeadSyncCaptureRequirements(body.payload) && !body.leadId) {
      return NextResponse.json(
        {
          success: false,
          error: "Für die Bewertung werden vollständige Adresse, E-Mail und Einwilligung benötigt.",
        },
        { status: 400 },
      );
    }

    let payload = mapLeadSyncPayloadToLeadPayload(body.payload);
    payload = { ...payload, id: body.leadId ?? payload.id };

    const parsed = leadCreateSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingaben." },
        { status: 400 },
      );
    }

    payload = parsed.data;

    if (hasAddress(payload) && (payload.lat == null || payload.lng == null)) {
      const geocoded = await geocodeAddress(payload);
      if (geocoded) {
        payload = {
          ...payload,
          lat: geocoded.lat,
          lng: geocoded.lng,
          district: payload.district ?? geocoded.district ?? null,
          city: payload.city ?? geocoded.city ?? null,
          landkreis: payload.landkreis ?? geocoded.landkreis ?? null,
        };
      }
    }

    let lead = await upsertLeadRequest({
      leadId: body.leadId,
      payload,
      status: hasAddress(payload) ? "address_captured" : "email_captured",
      ipHash: hashPrivacyValue(clientIp),
      userAgentHash: hashPrivacyValue(request.headers.get("user-agent")),
    });
    leadId = lead.id;

    let propstackSyncError: string | null = null;

    try {
      if (lead.email) {
        const contactId = await createOrUpdateContact({
          contactId: lead.propstack_contact_id,
          email: lead.email,
          firstname: lead.firstname,
          lastname: lead.lastname,
          phone: lead.phone,
          consent: lead.consent_given,
        });

        if (!contactId) {
          throw new Error("Propstack-Kontakt konnte nicht bestätigt werden.");
        }

        lead = (await updateLeadPropstackIds({ leadId: lead.id, contactId })) ?? lead;
      }

      if (hasAddress(lead)) {
        const propertyId = await createOrUpdateProperty({
          propertyId: lead.propstack_property_id,
          lead,
        });

        if (!propertyId) {
          throw new Error("Propstack-Immobilie konnte nicht bestätigt werden.");
        }

        lead = (await updateLeadPropstackIds({ leadId: lead.id, propertyId })) ?? lead;
      }
    } catch (error) {
      propstackSyncError = error instanceof Error ? error.message : String(error);
      await insertLeadEvent({
        leadRequestId: lead.id,
        eventName: "valuation_failed",
        payload: { stage: "propstack_finalize", message: propstackSyncError },
      });
    }

    if (propstackSyncError) {
      return NextResponse.json(
        { success: false, leadId: lead.id, error: `Propstack-Sync fehlgeschlagen: ${propstackSyncError}` },
        { status: 502 },
      );
    }

    const result = await calculateLeadReportForLead({ leadRequestId: lead.id, request });
    if (result.success !== true) {
      return NextResponse.json(result, { status: "status" in result ? result.status : 500 });
    }

    return NextResponse.json(
      {
        leadId: lead.id,
        leadRequestId: result.leadRequestId,
        reportId: result.reportId,
        manualReview: "manualReview" in result ? result.manualReview : undefined,
        reason: "reason" in result ? result.reason : undefined,
        expiresAt: result.expiresAt,
        emailProvider: result.emailProvider,
        emailSentAt: result.emailSentAt,
        email: result.email,
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    const retryAfter = (error as Error & { retryAfterSeconds?: number }).retryAfterSeconds;
    return NextResponse.json(
      {
        success: false,
        leadId,
        error: error instanceof Error ? error.message : "Bewertung konnte nicht erstellt werden.",
      },
      { status: retryAfter ? 429 : 500, headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined },
    );
  }
}
