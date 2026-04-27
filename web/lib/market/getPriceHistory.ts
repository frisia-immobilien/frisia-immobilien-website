import "server-only";

import { sql } from "@/lib/db";
import type { PriceHistoryObjectType, PriceHistoryRow } from "@/lib/types/leadgen";

export async function getPriceHistory(input: {
  object_type: PriceHistoryObjectType;
  location_slug: string;
  limit?: number;
}) {
  let rows: PriceHistoryRow[] = [];
  try {
    rows = (await sql`
      SELECT *
      FROM price_history
      WHERE object_type = ${input.object_type}
        AND location_slug = ${input.location_slug}
        AND median_preis_eur_m2 IS NOT NULL
      ORDER BY year ASC
    `) as PriceHistoryRow[];
  } catch {
    rows = [];
  }

  if (typeof input.limit === "number" && input.limit > 0) {
    return rows.slice(Math.max(0, rows.length - input.limit));
  }

  return rows;
}
