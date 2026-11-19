import { NextRequest, NextResponse } from "next/server";
import { reportError } from "@/lib/report-error";

/**
 * Receives errors caught by app/error.tsx and app/global-error.tsx in the
 * browser and forwards them to reportError (structured log + optional
 * ERROR_WEBHOOK_URL). Size-capped and lightly rate-limited per IP.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, { n: number; reset: number }>();

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) hits.set(ip, { n: 1, reset: now + WINDOW_MS });
  else if (++h.n > MAX_PER_WINDOW) return new NextResponse(null, { status: 429 });
  if (hits.size > 5000) hits.clear();

  const raw = await request.text();
  if (raw.length > 16_000) return new NextResponse(null, { status: 413 });
  let body: { message?: string; stack?: string; digest?: string; url?: string; boundary?: string } = {};
  try { body = JSON.parse(raw); } catch { return new NextResponse(null, { status: 400 }); }

  const err = new Error(String(body.message || "Client error").slice(0, 500));
  err.name = "ClientError";
  err.stack = body.stack ? String(body.stack).slice(0, 4000) : undefined;
  reportError(err, {
    source: "browser",
    boundary: String(body.boundary || "app").slice(0, 40),
    digest: body.digest ? String(body.digest).slice(0, 100) : undefined,
    url: body.url ? String(body.url).slice(0, 500) : undefined,
    userAgent: request.headers.get("user-agent")?.slice(0, 300),
  });
  return new NextResponse(null, { status: 204 });
}
