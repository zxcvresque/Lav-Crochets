import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { ShopPage } from "@/components/site/shop-page";
import { getSiteProducts, CATEGORY_META } from "@/lib/catalog";

export const metadata: Metadata = pageMeta({
  title: "Shop — Lav Crochets",
  description: "Shop handmade crochet bag charms, hair accessories and keychains. Order online, pay securely with Razorpay, delivered in 4 to 5 days.",
  path: "/shop",
});

export default async function Page({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const initialCat = CATEGORY_META.some((c) => c.id === cat) ? cat! : "all";
  const products = await getSiteProducts();
  return <ShopPage key={initialCat} products={products} initialCat={initialCat} section="all" />;
}
