import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { Prisma } from "@prisma/client";

// GET /api/orders — admins see all orders; customers see their own (by account or checkout email).
// Orders are only ever created by /api/razorpay/order, so there is no POST here.
export async function GET(request: NextRequest) {
  const { user, error } = await requireUser(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20") || 20));

  const where: Prisma.OrderWhereInput = status ? { orderStatus: status } : {};
  if (user.role !== "admin") {
    where.OR = [{ userId: user.id }, { customerEmail: user.email.toLowerCase() }];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { items: { include: { product: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, limit });
}
