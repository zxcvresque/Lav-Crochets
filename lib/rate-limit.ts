import { NextRequest, NextResponse } from "next/server";

/**
 * Small in-memory sliding-window rate limiter for public form endpoints.
 * The app runs as a single Node process (Docker standalone), so a Map is
 * enough; if it is ever scaled out, swap this for a shared store.
 */
const hits = new Map<string, number[]>();
let lastSweep = Date.now();

export function clientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : request.headers.get("x-real-ip") || "local").trim();
}

/**
 * Returns a 429 response when `key` has used `limit` requests within
 * `windowMs`, otherwise records the hit and returns null.
 */
export function rateLimit(request: NextRequest, bucket: string, limit: number, windowMs: number): NextResponse | null {
  const now = Date.now();
  const key = `${bucket}:${clientIp(request)}`;
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    const retry = Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000));
    hits.set(key, recent);
    return NextResponse.json(
      { error: "Too many requests, wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(retry) } },
    );
  }
  recent.push(now);
  hits.set(key, recent);
  // Occasionally drop stale keys so the map cannot grow without bound.
  if (now - lastSweep > 10 * 60_000) {
    lastSweep = now;
    for (const [k, v] of hits) if (!v.some((t) => now - t < 60 * 60_000)) hits.delete(k);
  }
  return null;
}
