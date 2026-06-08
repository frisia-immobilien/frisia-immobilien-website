import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_HOST = "frisia-immobilien.de";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"]);

function hostnameFromHeader(host: string) {
  if (host.startsWith("[")) {
    return host.slice(0, host.indexOf("]") + 1);
  }

  return host.split(":")[0] || host;
}

export function proxy(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host") || "";
  const hostname = hostnameFromHeader(host);
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const protocol = forwardedProto || request.nextUrl.protocol.replace(":", "");

  if (LOCAL_HOSTS.has(hostname) || hostname.endsWith(".local")) {
    return NextResponse.next();
  }

  if (host === CANONICAL_HOST && protocol === "https") {
    return NextResponse.next();
  }

  const canonicalUrl = request.nextUrl.clone();
  canonicalUrl.protocol = "https:";
  canonicalUrl.hostname = CANONICAL_HOST;
  canonicalUrl.port = "";

  return NextResponse.redirect(canonicalUrl, 301);
}

export const config = {
  matcher: "/:path*",
};
