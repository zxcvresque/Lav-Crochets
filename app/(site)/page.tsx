import { Hero } from "@/components/site/hero";
import {
  CuratedRow, ShopPaths, CategoryGrid, CustomOrders, QuoteBlock, InstagramRow, Newsletter,
} from "@/components/site/home-sections";
import { StitchLine } from "@/components/site/section-head";
import { FAQ } from "@/components/site/faq";
import { Testimonials } from "@/components/site/testimonials";
import { getSiteProducts, categoriesFor } from "@/lib/catalog";
import { getLatestInstagramPosts } from "@/lib/instagram";
import type { Metadata } from "next";
import { pageMeta, SITE_URL, SITE_NAME, absoluteUrl, jsonLd } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Lav Crochets — Handmade crochet, made with love.",
  description:
    "Handmade crochet bag charms, hair accessories and keychains, hooked by hand in Chhatrapati Sambhajinagar. Order online, pay securely with Razorpay, delivered in 4 to 5 days.",
  path: "/",
});

const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl("/apple-icon.png"),
  email: "hello@lav-crochets.art",
  sameAs: ["https://www.instagram.com/crochetsbylav"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Chhatrapati Sambhajinagar",
    addressRegion: "Maharashtra",
    addressCountry: "IN",
  },
};

// Rendered per request so admin changes show at once (and builds never bake in an empty catalogue).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, instagramPosts] = await Promise.all([getSiteProducts(), getLatestInstagramPosts(5)]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ORGANIZATION) }} />
      <Hero />
      <CuratedRow products={products} />
      <StitchLine />
      <QuoteBlock />
      <StitchLine />
      <ShopPaths products={products} />
      <CategoryGrid categories={categoriesFor(products)} />
      <Testimonials />
      <CustomOrders />
      <FAQ />
      <InstagramRow posts={instagramPosts} />
      <Newsletter />
    </>
  );
}
