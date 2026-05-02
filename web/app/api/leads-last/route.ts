import { NextResponse } from "next/server";
import { blockDebugRouteInProduction } from "@/lib/api/debugGuard";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  const blocked = blockDebugRouteInProduction(request);
  if (blocked) return blocked;

  const rows = await sql`
    SELECT created_at, plz, type, value_mid, expires_at, token_hash
    FROM leads
    ORDER BY created_at DESC
    LIMIT 3
  `;
  return NextResponse.json({ success: true, rows });
}
