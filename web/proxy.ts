import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_FILE_PATTERN = /\.[^/]+$/;

const ALLOWED_PATHS = ["/coming-soon", "/favicon.ico", "/robots.txt", "/sitemap.xml"];
const ALLOWED_PREFIXES = ["/_next", "/api"];
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

export function proxy(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl;

  if (LOCAL_HOSTNAMES.has(hostname)) {
    return NextResponse.next();
  }

  if (
    ALLOWED_PATHS.includes(pathname) ||
    ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    PUBLIC_FILE_PATTERN.test(pathname)
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/coming-soon";
  url.search = "";

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/:path*"],
};
