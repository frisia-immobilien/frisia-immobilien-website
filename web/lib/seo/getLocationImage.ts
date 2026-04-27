import "server-only";

import { sql } from "@/lib/db";
import type { SeoPageType } from "@/lib/types/leadgen";

type SeoImageRow = {
  file_path: string;
  alt_text: string | null;
  title: string | null;
  caption: string | null;
};

const FALLBACKS = {
  region: "/images/regions/fallback/region-ostfriesland.jpg",
  city: "/images/regions/fallback/city-default.jpg",
  district: "/images/regions/fallback/district-default.jpg",
};

export async function getLocationImage(input: {
  location_slug: string;
  page_type: SeoPageType;
  location_label: string;
  location_type?: string | null;
}) {
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

  const src =
    input.location_type === "region"
      ? FALLBACKS.region
      : input.location_type === "ortsteil"
        ? FALLBACKS.district
        : FALLBACKS.city;

  return {
    src,
    alt: `Immobilienmarkt in ${input.location_label} - Frisia Immobilien`,
    title: `Immobilienmarkt ${input.location_label}`,
    caption: null,
    isFallback: true,
  };
}
