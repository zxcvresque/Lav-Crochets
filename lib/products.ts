import { NextResponse } from "next/server";
import { prisma } from "./prisma";

export const PRODUCT_FIELDS = [
  "slug", "title", "category", "chip", "materials", "sizeOptions", "colorOptions",
  "stockStatus", "turnaroundDays", "priceINR", "wasINR", "care", "description",
  "images", "sortOrder", "published",
] as const;

/** Products that have been ordered are unpublished instead of deleted, so order history stays intact. */
export async function deleteProduct(id: string) {
  const ordered = await prisma.orderItem.count({ where: { productId: id } });
  if (ordered > 0) {
    await prisma.product.update({ where: { id }, data: { published: false } });
    return NextResponse.json({ success: true, unpublished: true });
  }
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
