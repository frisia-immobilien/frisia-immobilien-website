import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  const rows = await sql`
    SELECT created_at, plz, type, value_mid, expires_at, token_hash
    FROM leads
    ORDER BY created_at DESC
    LIMIT 3
  `;
  return NextResponse.json({ success: true, rows });
}
