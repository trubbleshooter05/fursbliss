import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/api/webhooks/") &&
    request.nextUrl.pathname.length > "/api/webhooks/".length &&
    request.nextUrl.pathname.endsWith("/")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = request.nextUrl.pathname.replace(/\/+$/, "");
    return NextResponse.rewrite(url);
  }

  if (request.nextUrl.pathname.startsWith("/api/webhooks/")) {
    return NextResponse.next();
  }

  const host = request.headers.get("host");
  if (!host) {
    return NextResponse.next();
  }

  if (host === "fursbliss.com") {
    const url = request.nextUrl.clone();
    url.host = "www.fursbliss.com";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
