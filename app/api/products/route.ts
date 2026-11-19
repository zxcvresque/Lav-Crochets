import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, pick } from "@/lib/api";
import { PRODUCT_FIELDS, deleteProduct } from "@/lib/products";
import { getSessionUser, isAdmin } from "@/lib/auth";


// GET /api/products — public list of published products. Admins get drafts too with ?all=1.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const stockStatus = searchParams.get("stockStatus");
  const wantAll = searchParams.get("all") === "1";

  const where: Record<string, unknown> = {};
  if (!(wantAll && isAdmin(await getSessionUser(request.headers)))) where.published = true;
  if (category) where.category = category;
  if (stockStatus) where.stockStatus = stockStatus;

  const products = await prisma.product.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const data = pick(await request.json(), PRODUCT_FIELDS);
  if (!data.slug || !data.title || !data.category || typeof data.priceINR !== "number") {
    return NextResponse.json({ error: "slug, title, category and priceINR are required" }, { status: 400 });
  }
  try {
    const product = await prisma.product.create({ data: data as never });
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create product (is the slug already used?)" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  try {
    const product = await prisma.product.update({ where: { id: body.id }, data: pick(body, PRODUCT_FIELDS) });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Could not update product" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  return deleteProduct(id);
}

