import { NextRequest, NextResponse } from "next/server";

function isPublicSeoSurface(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/check" ||
    pathname.startsWith("/check/") ||
    pathname === "/symptoms" ||
    pathname.startsWith("/symptoms/")
  );
}

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
    // Stripe webhooks must not 308 — Stripe treats redirect as delivery failure.
    if (request.nextUrl.pathname.startsWith("/api/stripe/")) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.host = "www.fursbliss.com";
    return NextResponse.redirect(url, 308);
  }

  // /, /check, /symptoms*: public HTML — no auth in middleware; no user-agent blocking (Googlebot-safe).
  if (isPublicSeoSurface(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
