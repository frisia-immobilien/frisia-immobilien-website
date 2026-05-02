import { NextResponse } from "next/server";

import { resolveMarketCoverage } from "@/lib/market/resolveMarketCoverage";
import type { MarketObjectType } from "@/lib/types/leadgen";

export const runtime = "nodejs";

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function mapObjectType(value: unknown): MarketObjectType | null {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === "house" || normalized === "haus") return "haus";
  if (normalized === "apartment" || normalized === "wohnung") return "wohnung";
  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await resolveMarketCoverage({
      object_type: mapObjectType(searchParams.get("propertyType")),
      city: searchParams.get("city"),
      district: searchParams.get("district"),
      postal_code: searchParams.get("postalCode"),
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("market coverage failed", error);
    return NextResponse.json(
      {
        success: false,
        covered: false,
        regionHint: "other",
        marketLevel: "none",
        locationLabel: null,
        leadgenGeeignet: false,
        hasPrice: false,
        error: "Kerngebiet konnte nicht geprüft werden.",
      },
      { status: 500 },
    );
  }
}
