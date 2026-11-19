import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductScene } from "@/components/site/product-scene";
import { Testimonials } from "@/components/site/testimonials";
import { toSiteProduct, CATEGORY_META, type SiteProduct } from "@/lib/catalog";
import { pageMeta, absoluteUrl, jsonLd, SITE_NAME } from "@/lib/site";

// Cached per request so generateMetadata and the page share one query.
const load = cache(async (slug: string) => {
  const row = await prisma.product.findUnique({ where: { slug } });
  return row && row.published ? toSiteProduct(row) : null;
});

export const dynamic = "force-dynamic";

function describe(product: SiteProduct) {
  return product.description || `${product.title}, handmade crochet by ${SITE_NAME}. ${product.turnaround}.`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await load((await params).slug);
  if (!product) return { title: "Page not found — Lav Crochets", robots: { index: false } };
  return pageMeta({
    title: `${product.title} — Lav Crochets`,
    description: describe(product),
    path: `/product/${product.slug}`,
    images: product.img ? [product.img] : undefined,
  });
}

function productJsonLd(product: SiteProduct) {
  const url = absoluteUrl(`/product/${product.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: describe(product),
    sku: product.slug,
    url,
    ...(product.img && { image: [absoluteUrl(product.img)] }),
    category: CATEGORY_META.find((c) => c.id === product.category)?.title,
    ...(product.materials && { material: product.materials }),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url,
      price: product.priceINR.toFixed(2),
      priceCurrency: "INR",
      availability:
        product.stockStatus === "ready" ? "https://schema.org/InStock" : "https://schema.org/MadeToOrder",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await load((await params).slug);
  if (!product) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productJsonLd(product)) }} />
      <ProductScene product={product} categories={[...CATEGORY_META]} />
      <Testimonials compact productSlug={product.slug} />
    </>
  );
}
