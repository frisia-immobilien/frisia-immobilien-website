import { NextResponse } from "next/server";
import {
  createSearchRequestInPropstack,
  type SearchRequestInput,
} from "@/lib/propstack-search-request";

const VALID_MARKETING_TYPES = ["BUY", "RENT", "BOTH"] as const;
const VALID_SALE_ANSWERS = ["YES", "NO"] as const;

function normalizeText(value: unknown, maxLength = 500) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function normalizeNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(String(value).replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function normalizeStringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => normalizeText(entry, 80))
    .filter(Boolean)
    .slice(0, 8);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parsePayload(value: unknown): { payload?: SearchRequestInput; error?: string } {
  const input = (value ?? {}) as Record<string, unknown>;
  const marketingType = normalizeText(input.marketingType, 8);
  const email = normalizeText(input.email, 160).toLowerCase();
  const firstName = normalizeText(input.firstName, 80);
  const lastName = normalizeText(input.lastName, 80);
  const locations = normalizeText(input.locations, 300);
  const saleIfBuyer = normalizeText(input.saleIfBuyer, 8);
  const addressStreet = normalizeText(input.addressStreet, 120);
  const addressHouseNumber = normalizeText(input.addressHouseNumber, 40);
  const addressPostalCode = normalizeText(input.addressPostalCode, 20);
  const addressCity = normalizeText(input.addressCity, 120);
  const consent = input.consent === true;

  if (!VALID_MARKETING_TYPES.includes(marketingType as SearchRequestInput["marketingType"])) {
    return { error: "Bitte wähle Kauf, Miete oder beides aus." };
  }

  if (!firstName || !lastName) {
    return { error: "Bitte gib Vor- und Nachnamen an." };
  }

  if (!isValidEmail(email)) {
    return { error: "Bitte gib eine gültige E-Mail-Adresse an." };
  }

  if (!locations) {
    return { error: "Bitte gib mindestens einen Suchort an." };
  }

  if (!VALID_SALE_ANSWERS.includes(saleIfBuyer as SearchRequestInput["saleIfBuyer"])) {
    return { error: "Bitte beantworte die Frage zur eigenen Immobilie." };
  }

  if (!addressStreet || !addressHouseNumber || !addressPostalCode || !addressCity) {
    return { error: "Bitte gib deine vollständige Adresse an." };
  }

  if (!consent) {
    return { error: "Bitte bestätige die Einwilligung zur Kontaktaufnahme." };
  }

  return {
    payload: {
      marketingType: marketingType as SearchRequestInput["marketingType"],
      propertyTypes: normalizeStringList(input.propertyTypes),
      locations,
      searchRadiusKm: normalizeNumber(input.searchRadiusKm),
      budgetMax: normalizeNumber(input.budgetMax),
      livingSpaceMin: normalizeNumber(input.livingSpaceMin),
      roomsMin: normalizeNumber(input.roomsMin),
      moveInTiming: normalizeText(input.moveInTiming, 120),
      financingStatus: normalizeText(input.financingStatus, 120),
      saleIfBuyer: saleIfBuyer as SearchRequestInput["saleIfBuyer"],
      notes: normalizeText(input.notes, 1000),
      firstName,
      lastName,
      email,
      phone: normalizeText(input.phone, 80),
      addressStreet,
      addressHouseNumber,
      addressPostalCode,
      addressCity,
      consent,
    },
  };
}

export async function POST(request: Request) {
  try {
    const parsed = parsePayload(await request.json());
    if (!parsed.payload) {
      return NextResponse.json({ ok: false, message: parsed.error ?? "Die Angaben sind unvollständig." }, { status: 400 });
    }

    const result = await createSearchRequestInPropstack(parsed.payload);

    return NextResponse.json({
      ok: true,
      message: "Dein Suchauftrag wurde angelegt.",
      contactId: result.contactId,
      savedQueryId: result.savedQueryId,
      taskId: result.taskId,
    });
  } catch (error) {
    console.error("Suchauftrag konnte nicht an Propstack übertragen werden", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Der Suchauftrag konnte gerade nicht übertragen werden. Bitte versuche es später erneut.",
      },
      { status: 500 },
    );
  }
}
