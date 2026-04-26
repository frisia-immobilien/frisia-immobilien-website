import { NextResponse } from "next/server";

import {
  type LeadProgressRecord,
  updateLeadProgressSyncState,
  upsertLeadProgress,
} from "@/lib/lead-progress";
import {
  findBestMarketRecord,
} from "@/lib/immobilienbewertung/market-data";
import {
  markLeadEmailSent,
  upsertLeadValuationRecord,
} from "@/lib/immobilienbewertung/lead-records";
import { sendLeadValuationEmails } from "@/lib/immobilienbewertung/lead-emails";
import { calculateLeadValuation } from "@/lib/immobilienbewertung/valuation";
import {
  hasLeadSyncLocation,
  hasLeadSyncCaptureRequirements,
  normalizeLeadEmail,
  type LeadSyncPayload,
} from "@/lib/lead-sync";
import { syncLeadProgressToPropstack } from "@/lib/propstack-crm";
import { expiresAtDays, hashToken, makeToken } from "@/lib/tokens";

export const runtime = "nodejs";

type LeadFinalizeBody = {
  leadId?: string | null;
  payload?: LeadSyncPayload;
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

function getBaseUrl(request: Request) {
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  }

  const proto = request.headers.get("x-forwarded-proto") || "http";
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "localhost:3000";

  return `${proto}://${host}`;
}

function validateFinalizePayload(payload: LeadSyncPayload) {
  if (!payload.propertyType) {
    return "Objektart fehlt.";
  }

  if (!hasLeadSyncLocation(payload)) {
    return "Für die Bewertung werden vollständige Adressdaten inklusive Hausnummer benötigt.";
  }

  if (!isValidEmail(payload.email)) {
    return "Bitte eine gültige E-Mail-Adresse angeben.";
  }

  if (payload.consent !== true) {
    return "Die Einwilligung zum Versand der Bewertung fehlt.";
  }

  if (!normalizeText(payload.person?.firstName)) {
    return "Vorname fehlt.";
  }

  if (!normalizeText(payload.person?.lastName)) {
    return "Nachname fehlt.";
  }

  if (!isValidPhone(payload.person?.phone)) {
    return "Bitte eine gültige Telefonnummer angeben.";
  }

  if (payload.propertyType === "house" || payload.propertyType === "apartment") {
    if (!isFinitePositive(payload.facts?.livingArea)) {
      return "Für die Bewertung wird eine gültige Wohnfläche benötigt.";
    }

    if (!isValidYear(payload.facts?.yearBuilt)) {
      return "Für die Bewertung wird ein gültiges Baujahr benötigt.";
    }
  }

  if (payload.propertyType === "house") {
    if (!isFinitePositive(payload.facts?.landSize)) {
      return "Für Häuser wird eine Grundstücksfläche benötigt.";
    }
    if (!isFinitePositive(payload.facts?.rooms)) {
      return "Für Häuser wird eine Zimmeranzahl benötigt.";
    }
    if (!payload.facts?.reason || payload.facts.reason === "unknown") {
      return "Bitte den Anlass der Bewertung angeben.";
    }
    if (!payload.facts?.usage || payload.facts.usage === "unknown") {
      return "Bitte die aktuelle Nutzung der Immobilie angeben.";
    }
  }

  if (payload.propertyType === "apartment") {
    if (!isFinitePositive(payload.facts?.rooms)) {
      return "Für Wohnungen wird eine Zimmeranzahl benötigt.";
    }
  }

  if (payload.propertyType === "land") {
    if (!isFinitePositive(payload.facts?.landSize)) {
      return "Für Grundstücke wird eine Grundstücksfläche benötigt.";
    }
    if (!payload.facts?.erschliessung) {
      return "Bitte den Erschließungsstatus angeben.";
    }
    if (!payload.facts?.bebaubarkeit) {
      return "Bitte die Bebaubarkeit angeben.";
    }
    if (!payload.facts?.bebauungsgebiet) {
      return "Bitte das Bebauungsgebiet angeben.";
    }
  }

  return null;
}

async function persistAndSyncLead(progress: LeadProgressRecord) {
  const synced = await syncLeadProgressToPropstack(progress);

  await updateLeadProgressSyncState(progress.id, {
    propstackContactId: synced.contactId,
    propstackPropertyId: synced.propertyId,
    propstackDealId: synced.dealId,
    propstackTaskId: synced.taskId,
    ownerLinked: synced.ownerLinked,
    lastError: null,
  });

  return synced;
}

export async function POST(request: Request) {
  let progress: LeadProgressRecord | null = null;

  try {
    if (!process.env.TOKEN_SECRET) {
      return NextResponse.json(
        { success: false, error: "TOKEN_SECRET fehlt." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as LeadFinalizeBody;

    if (!isLeadSyncPayload(body.payload)) {
      return NextResponse.json(
        { success: false, error: "Bewertungsdaten fehlen oder sind ungültig." },
        { status: 400 },
      );
    }

    const validationError = validateFinalizePayload(body.payload);
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 },
      );
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

    progress = await upsertLeadProgress({
      leadId: body.leadId,
      phase: "result",
      payload: body.payload,
    });

    await persistAndSyncLead(progress);

    const marketMatch = await findBestMarketRecord({
      postalCode: body.payload.location?.postalCode,
      city: body.payload.location?.city,
      district: body.payload.location?.district,
    });

    const valuation = await calculateLeadValuation({
      payload: body.payload,
      marketRecord: marketMatch.record,
      marketScope: marketMatch.scope,
    });

    const token = makeToken();
    const tokenHash = hashToken(token, process.env.TOKEN_SECRET);
    const expiresAt = expiresAtDays(Number(process.env.TOKEN_TTL_DAYS || 30));

    const lead = await upsertLeadValuationRecord({
      leadProgress: progress,
      payload: body.payload,
      valuation,
      tokenHash,
      expiresAt,
    });

    const landingUrl = `${getBaseUrl(request)}/bewertung/${token}`;
    const sent = await sendLeadValuationEmails({
      lead,
      landingUrl,
    });
    const persistedLead = await markLeadEmailSent(lead.id, sent.provider, sent.messageId);

    return NextResponse.json({
      success: true,
      leadId: progress.id,
      value: {
        min: valuation.valueMin,
        mid: valuation.valueMid,
        max: valuation.valueMax,
        displayMid: valuation.displayMid,
        displayRange: valuation.displayRange,
      },
      landingUrl,
      expiresAt: expiresAt.toISOString(),
      email: normalizeLeadEmail(body.payload.email),
      emailSentAt: persistedLead?.email_sent_at ?? null,
      market: {
        scope: valuation.marketScope,
        locationLabel: valuation.marketRecord?.location_label ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (progress) {
      await updateLeadProgressSyncState(progress.id, { lastError: message });
    }

    return NextResponse.json(
      {
        success: false,
        leadId: progress?.id ?? null,
        error: message,
      },
      { status: 500 },
    );
  }
}
