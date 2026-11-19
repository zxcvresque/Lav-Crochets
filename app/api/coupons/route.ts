import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, pick } from "@/lib/api";

const COUPON_FIELDS = ["code", "type", "value", "minOrderINR", "usageLimit", "perUserLimit", "expiresAt", "active"] as const;

function normalise(data: Record<string, unknown>): { data?: Record<string, unknown>; error?: string } {
  const out = { ...data };
  if ("code" in out) out.code = String(out.code).toUpperCase().replace(/[^A-Z0-9]/g, "");
  if ("type" in out && !["flat", "percent"].includes(String(out.type))) return { error: "type must be 'flat' or 'percent'" };
  for (const k of ["value", "minOrderINR", "perUserLimit"]) {
    if (k in out) {
      const n = Number(out[k]);
      if (!Number.isInteger(n) || n < 0) return { error: `${k} must be a whole number` };
      out[k] = n;
    }
  }
  if ("usageLimit" in out) out.usageLimit = out.usageLimit === null || out.usageLimit === "" ? null : Number(out.usageLimit);
  if ("expiresAt" in out) out.expiresAt = out.expiresAt ? new Date(String(out.expiresAt)) : null;
  if (out.type === "percent" && typeof out.value === "number" && (out.value < 1 || out.value > 100)) {
    return { error: "percent value must be 1-100" };
  }
  return { data: out };
}

// GET /api/coupons — admin list
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { usages: true } } },
  });
  return NextResponse.json(coupons);
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const parsed = normalise(pick(await request.json(), COUPON_FIELDS));
  if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const data = parsed.data!;
  if (!data.code || !data.type || !data.value) {
    return NextResponse.json({ error: "code, type, and value are required" }, { status: 400 });
  }
  if (await prisma.coupon.findUnique({ where: { code: String(data.code) } })) {
    return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: String(data.code),
      type: String(data.type),
      value: Number(data.value),
      minOrderINR: (data.minOrderINR as number) ?? 0,
      usageLimit: (data.usageLimit as number | null) ?? null,
      perUserLimit: (data.perUserLimit as number) ?? 1,
      expiresAt: (data.expiresAt as Date | null) ?? null,
      active: data.active === undefined ? true : Boolean(data.active),
    },
  });
  return NextResponse.json(coupon, { status: 201 });
}

// PATCH /api/coupons — toggle active / update coupon
export async function PATCH(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const parsed = normalise(pick(body, COUPON_FIELDS));
  if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const updated = await prisma.coupon.update({ where: { id: body.id }, data: parsed.data! });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Could not update coupon" }, { status: 400 });
  }
}

// DELETE /api/coupons?id=xxx
export async function DELETE(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
