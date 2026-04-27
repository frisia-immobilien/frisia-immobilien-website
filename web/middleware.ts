import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_FILE_PATTERN = /\.[^/]+$/;

const ALLOWED_PATHS = ["/coming-soon", "/favicon.ico", "/robots.txt", "/sitemap.xml"];
const ALLOWED_PREFIXES = ["/_next", "/api"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
