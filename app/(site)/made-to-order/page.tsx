import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { ShopPage } from "@/components/site/shop-page";
import { getSiteProducts, CATEGORY_META } from "@/lib/catalog";

export const metadata: Metadata = pageMeta({
  title: "Made to order — Lav Crochets",
  description: "Crochet pieces hooked to order in your colours, then delivered in 4 to 5 days.",
  path: "/made-to-order",
});

export default async function Page({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const initialCat = CATEGORY_META.some((c) => c.id === cat) ? cat! : "all";
  const products = await getSiteProducts({ stockStatus: "made-to-order" });
  return <ShopPage key={initialCat} products={products} initialCat={initialCat} section="made-to-order" />;
}
