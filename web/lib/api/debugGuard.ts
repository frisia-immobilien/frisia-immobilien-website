import "server-only";

import { NextResponse } from "next/server";

export function blockDebugRouteInProduction(request: Request) {
  if (process.env.NODE_ENV !== "production") return null;

  const configuredToken = process.env.INTERNAL_API_TOKEN?.trim();
  const providedToken =
    request.headers.get("x-internal-api-token")?.trim() ||
    new URL(request.url).searchParams.get("internalToken")?.trim();

  if (configuredToken && providedToken === configuredToken) return null;

  return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
}
