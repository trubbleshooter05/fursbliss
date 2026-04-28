import { NextResponse } from "next/server";

export function logForbiddenResponse(url: string, userAgent: string | null, source?: string) {
  const line = JSON.stringify({
    event: "http_403",
    url,
    userAgent: userAgent ?? "",
    source: source ?? "unknown",
    time: new Date().toISOString(),
  });
  console.warn(line);
}

export function jsonForbidden(request: Request, body: unknown, init?: { headers?: HeadersInit }) {
  logForbiddenResponse(request.url, request.headers.get("user-agent"), "json");
  return NextResponse.json(body, { status: 403, headers: init?.headers });
}

export function responseForbidden(request: Request, body: BodyInit, init?: ResponseInit) {
  logForbiddenResponse(request.url, request.headers.get("user-agent"), "response");
  return new Response(body, { status: 403, ...init });
}
