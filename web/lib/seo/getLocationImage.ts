import "server-only";

import { sql } from "@/lib/db";
import { getRuntimeLocationImage } from "@/lib/market/runtimeLandingData";
import { formatLocationPhraseFromName } from "@/lib/seo/locationDisplay";
import type { SeoPageType } from "@/lib/types/leadgen";
import { hasActiveWebsiteSnapshot } from "@/lib/website-snapshot";

type SeoImageRow = {
  file_path: string;
  alt_text: string | null;
  title: string | null;
  caption: string | null;
};

const FALLBACKS = {
  region: "/images/regions/fallback/region-ostfriesland.webp",
  city: "/images/regions/fallback/city-default.webp",
  district: "/images/regions/fallback/district-default.webp",
};

export async function getLocationImage(input: {
  location_slug: string;
  page_type: SeoPageType;
  location_label: string;
  location_type?: string | null;
}) {
  const snapshotImage = getRuntimeLocationImage(input);
  if (snapshotImage) {
    return {
      src: snapshotImage.file_path || FALLBACKS.city,
      alt: snapshotImage.alt_text || `${input.location_label} - Frisia Immobilien`,
      title: snapshotImage.title || input.location_label,
      caption: snapshotImage.caption || null,
      isFallback: false,
    };
  }

  if (hasActiveWebsiteSnapshot()) {
    return fallbackLocationImage(input);
  }

  let rows: SeoImageRow[] = [];
  try {
    rows = (await sql`
      SELECT file_path, alt_text, title, caption
      FROM seo_location_images
      WHERE location_slug = ${input.location_slug}
        AND page_type = ${input.page_type}
        AND image_type = 'hero'
      ORDER BY sort_order ASC
      LIMIT 1
    `) as SeoImageRow[];
  } catch {
    rows = [];
  }

  const row = rows[0];
  if (row) {
    return {
      src: row.file_path,
      alt: row.alt_text || `${input.location_label} - Frisia Immobilien`,
      title: row.title || input.location_label,
      caption: row.caption || null,
      isFallback: false,
    };
  }

  return fallbackLocationImage(input);
}

function fallbackLocationImage(input: {
  location_label: string;
  location_type?: string | null;
}) {
  const src =
    input.location_type === "region"
      ? FALLBACKS.region
      : input.location_type === "ortsteil"
        ? FALLBACKS.district
        : FALLBACKS.city;

  return {
    src,
    alt: `Immobilienmarkt ${formatLocationPhraseFromName(input.location_label)} - Frisia Immobilien`,
    title: `Immobilienmarkt ${input.location_label}`,
    caption: null,
    isFallback: true,
  };
}
