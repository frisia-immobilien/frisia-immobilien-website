import { NextResponse } from "next/server";
import { blockDebugRouteInProduction } from "@/lib/api/debugGuard";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  const blocked = blockDebugRouteInProduction(request);
  if (blocked) return blocked;

  try {
    const result = await sql`SELECT 1 AS ok`;
    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
