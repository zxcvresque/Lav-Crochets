import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20") || 20));
  const search = searchParams.get("search") || "";
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { email: { contains: search } },
          { name: { contains: search } },
        ],
        role: "customer",
      }
    : { role: "customer" };

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        _count: {
          select: { orders: { where: { paymentStatus: "paid" } } },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  // Get total spent per customer
  const customerIds = customers.map((c) => c.id);
  const spendMap: Record<string, number> = {};

  if (customerIds.length > 0) {
    const spends = await prisma.order.groupBy({
      by: ["userId"],
      _sum: { totalINR: true },
      where: {
        userId: { in: customerIds },
        paymentStatus: "paid",
      },
    });
    for (const s of spends) {
      if (s.userId) spendMap[s.userId] = s._sum.totalINR ?? 0;
    }
  }

  const result = customers.map((c) => ({
    ...c,
    totalSpent: spendMap[c.id] ?? 0,
  }));

  return NextResponse.json({ customers: result, total, page, limit });
}
