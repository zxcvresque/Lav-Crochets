import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, isAdmin, type SessionUser } from "./auth";

type Guard =
  | { user: SessionUser; error?: undefined }
  | { user?: undefined; error: NextResponse };

export async function requireUser(request: NextRequest): Promise<Guard> {
  const user = await getSessionUser(request.headers);
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { user };
}

export async function requireAdmin(request: NextRequest): Promise<Guard> {
  const user = await getSessionUser(request.headers);
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!isAdmin(user)) return { error: NextResponse.json({ error: "Admin only" }, { status: 403 }) };
  return { user };
}

/** Keep only the listed keys from an untrusted request body. */
export function pick<T extends Record<string, unknown>>(body: T, keys: readonly string[]) {
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in body) out[k] = body[k];
  return out;
}

/** Escape user-supplied text before putting it into an HTML email. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function discountFor(type: string, value: number, subtotal: number): number {
  const raw = type === "percent" ? Math.round((subtotal * value) / 100) : type === "flat" ? value : 0;
  return Math.max(0, Math.min(raw, subtotal));
}
