import { NextResponse } from "next/server";

import { getLeadByToken } from "@/lib/immobilienbewertung/lead-records";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { success: false, error: "missing token" },
      { status: 400 },
    );
  }

  const lead = await getLeadByToken(token);

  if (!lead) {
    return NextResponse.json(
      { success: false, error: "not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    lead,
  });
}
