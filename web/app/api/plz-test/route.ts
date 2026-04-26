import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const res = await sql`
      SELECT plz, house_eur_m2, apartment_eur_m2, land_eur_m2
      FROM plz_medians
      WHERE plz = '26605'
    `;
    return NextResponse.json({ success: true, rows: res });
  } catch (e: unknown) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
