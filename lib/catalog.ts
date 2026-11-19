import { prisma } from "./prisma";

/** Product in the shape the original site's components expect (components/site/*). */
export interface SiteProduct {
  id: string;
  slug: string;
  title: string;
  category: string;
  chip?: "new" | "sale" | "pick";
  materials?: string;
  sizeOptions: string[];
  colorOptions: string[];
  stockStatus: "ready" | "made-to-order";
  turnaround: string;
  priceINR: number;
  wasINR?: number;
  care?: string;
  img?: string;
  /** Second photo, crossfaded in on card hover when present. */
  img2?: string;
  artVariant: string;
  description?: string;
}

export const CATEGORY_META = [
  { id: "charms", title: "Bag charms", tone: "coral" },
  { id: "hair", title: "Hair accessories", tone: "joy" },
  { id: "keychains", title: "Keychains", tone: "plum" },
  { id: "cases", title: "Pouches & cases", tone: "sun" },
] as const;

const ART_BY_CATEGORY: Record<string, string> = { charms: "hearts", hair: "flower", keychains: "yarn", cases: "granny" };

function list(value: string | null): string[] {
  if (!value) return [];
  try {
    const v = JSON.parse(value);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

type Row = Awaited<ReturnType<typeof prisma.product.findMany>>[number];

export function toSiteProduct(p: Row): SiteProduct {
  const ready = p.stockStatus === "ready";
  const chip = p.chip === "bestseller" ? "pick" : p.chip;
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    chip: chip === "new" || chip === "sale" || chip === "pick" ? chip : undefined,
    materials: p.materials ?? undefined,
    sizeOptions: list(p.sizeOptions),
    colorOptions: list(p.colorOptions),
    stockStatus: ready ? "ready" : "made-to-order",
    turnaround: ready
      ? "Delivered in 4 to 5 days"
      : `Made in about ${p.turnaroundDays} days, then delivered in 4 to 5 days`,
    priceINR: p.priceINR,
    wasINR: p.wasINR ?? undefined,
    care: p.care ?? undefined,
    img: list(p.images)[0],
    img2: list(p.images)[1],
    artVariant: ART_BY_CATEGORY[p.category] || "yarn",
    description: p.description ?? undefined,
  };
}

/** Published products, in admin sort order. */
export async function getSiteProducts(filter: { stockStatus?: "ready" | "made-to-order" } = {}): Promise<SiteProduct[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { published: true, ...(filter.stockStatus && { stockStatus: filter.stockStatus }) },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map(toSiteProduct);
  } catch (e) {
    console.error("[catalog] could not load products:", e);
    return [];
  }
}

/** Collections with live counts; collections with no published pieces are dropped. */
export function categoriesFor(products: SiteProduct[]) {
  return CATEGORY_META.map((c) => ({ ...c, count: products.filter((p) => p.category === c.id).length })).filter(
    (c) => c.count > 0,
  );
}
