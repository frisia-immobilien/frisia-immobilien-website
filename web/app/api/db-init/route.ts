import { NextResponse } from "next/server";
import { blockDebugRouteInProduction } from "@/lib/api/debugGuard";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  const blocked = blockDebugRouteInProduction(request);
  if (blocked) return blocked;

  await sql`
    CREATE TABLE IF NOT EXISTS plz_medians (
      plz TEXT PRIMARY KEY,
      house_eur_m2 INT NOT NULL,
      apartment_eur_m2 INT NOT NULL,
      land_eur_m2 INT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  return NextResponse.json({ success: true });
}
