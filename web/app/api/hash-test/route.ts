import { NextResponse } from "next/server";
import { hashToken } from "@/lib/tokens";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const secret = process.env.TOKEN_SECRET || "";

  if (!token) return NextResponse.json({ success: false, error: "missing token" }, { status: 400 });
  if (!secret) return NextResponse.json({ success: false, error: "TOKEN_SECRET missing" }, { status: 500 });

  const tokenHash = hashToken(token, secret);
  return NextResponse.json({ success: true, tokenHash, secretLength: secret.length });
}