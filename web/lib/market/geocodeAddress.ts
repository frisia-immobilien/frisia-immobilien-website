import "server-only";

import { env } from "@/lib/env";

export type GeocodeResult = {
  lat: number;
  lng: number;
  district?: string | null;
  city?: string | null;
  landkreis?: string | null;
};

function normalizeText(value: unknown) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export async function geocodeAddress(input: {
  street?: string | null;
  house_number?: string | null;
  postal_code?: string | null;
  city?: string | null;
}): Promise<GeocodeResult | null> {
  const address = [
    [input.street, input.house_number].filter(Boolean).join(" "),
    [input.postal_code, input.city].filter(Boolean).join(" "),
    "Deutschland",
  ]
    .filter(Boolean)
    .join(", ");

  if (!address.trim()) return null;

  if (env.GOOGLE_MAPS_API_KEY) {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", address);
    url.searchParams.set("key", env.GOOGLE_MAPS_API_KEY);
    url.searchParams.set("language", "de");
    url.searchParams.set("region", "de");

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      results?: Array<{
        geometry?: { location?: { lat?: number; lng?: number } };
        address_components?: Array<{ long_name?: string; types?: string[] }>;
      }>;
    };

    const first = data.results?.[0];
    const location = first?.geometry?.location;
    if (typeof location?.lat !== "number" || typeof location.lng !== "number") return null;

    const components = first?.address_components ?? [];
    const findComponent = (type: string) =>
      normalizeText(components.find((component) => component.types?.includes(type))?.long_name);

    return {
      lat: location.lat,
      lng: location.lng,
      district: findComponent("sublocality") ?? findComponent("neighborhood"),
      city: findComponent("locality") ?? input.city ?? null,
      landkreis: findComponent("administrative_area_level_3"),
    };
  }

  if (env.OPENCAGE_API_KEY) {
    const url = new URL("https://api.opencagedata.com/geocode/v1/json");
    url.searchParams.set("q", address);
    url.searchParams.set("key", env.OPENCAGE_API_KEY);
    url.searchParams.set("language", "de");
    url.searchParams.set("countrycode", "de");
    url.searchParams.set("limit", "1");

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      results?: Array<{
        geometry?: { lat?: number; lng?: number };
        components?: { suburb?: string; city?: string; town?: string; county?: string };
      }>;
    };
    const first = data.results?.[0];
    if (typeof first?.geometry?.lat !== "number" || typeof first.geometry.lng !== "number") return null;

    return {
      lat: first.geometry.lat,
      lng: first.geometry.lng,
      district: first.components?.suburb ?? null,
      city: first.components?.city ?? first.components?.town ?? input.city ?? null,
      landkreis: first.components?.county ?? null,
    };
  }

  return null;
}
