import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api";

// POST /api/products/reorder { ids: string[] } — saves the admin's drag-and-drop order.
export async function POST(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { ids } = await request.json().catch(() => ({}));
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
    return NextResponse.json({ error: "ids must be a list of product ids" }, { status: 400 });
  }
  await prisma.$transaction(ids.map((id: string, i: number) => prisma.product.update({ where: { id }, data: { sortOrder: i } })));
  return NextResponse.json({ success: true });
}
