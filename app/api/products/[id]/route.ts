import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, pick } from "@/lib/api";
import { PRODUCT_FIELDS, deleteProduct } from "@/lib/products";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || !product.published) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const { id } = await params;
  try {
    const product = await prisma.product.update({ where: { id }, data: pick(await request.json(), PRODUCT_FIELDS) });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Could not update product" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const { id } = await params;
  return deleteProduct(id);
}
