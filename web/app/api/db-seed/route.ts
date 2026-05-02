import { NextResponse } from "next/server";
import { blockDebugRouteInProduction } from "@/lib/api/debugGuard";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  const blocked = blockDebugRouteInProduction(request);
  if (blocked) return blocked;

  await sql`
    INSERT INTO plz_medians (plz, house_eur_m2, apartment_eur_m2, land_eur_m2)
    VALUES ('26605', 2800, 3100, 220)
    ON CONFLICT (plz) DO UPDATE
    SET house_eur_m2 = EXCLUDED.house_eur_m2,
        apartment_eur_m2 = EXCLUDED.apartment_eur_m2,
        land_eur_m2 = EXCLUDED.land_eur_m2,
        updated_at = NOW();
  `;

  return NextResponse.json({ success: true, seeded: "26605" });
}
