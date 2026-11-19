import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { ShopPage } from "@/components/site/shop-page";
import { getSiteProducts, CATEGORY_META } from "@/lib/catalog";

export const metadata: Metadata = pageMeta({
  title: "Ready to ship — Lav Crochets",
  description: "Handmade crochet pieces ready to ship now, delivered in 4 to 5 days anywhere in India.",
  path: "/ready-to-ship",
});

export default async function Page({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const initialCat = CATEGORY_META.some((c) => c.id === cat) ? cat! : "all";
  const products = await getSiteProducts({ stockStatus: "ready" });
  return <ShopPage key={initialCat} products={products} initialCat={initialCat} section="ready" />;
}
