/** Public site origin, used for canonical URLs, the sitemap and social cards. */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export const SITE_NAME = "Lav Crochets";

export const DEFAULT_OG_ALT = "Lav Crochets: handmade crochet, made with love.";

/** Absolute URL for a site path (or pass through an already absolute URL). */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Serialise JSON-LD safely for an inline <script> (no early </script> close). */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

interface PageMetaInput {
  title: string;
  description: string;
  /** Site path, e.g. "/shop". Becomes the canonical URL and og:url. */
  path: string;
  images?: string[];
}

/**
 * Page metadata with canonical + Open Graph + Twitter filled in.
 * Next replaces (not merges) a parent's openGraph object, so shared fields are repeated here.
 */
export function pageMeta({ title, description, path, images }: PageMetaInput) {
  // A page-level openGraph object hides the root app/opengraph-image, so fall back to it explicitly.
  const ogImages = images?.length
    ? images.map((url) => ({ url, alt: title }))
    : [{ url: "/opengraph-image", width: 1200, height: 630, alt: DEFAULT_OG_ALT }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website" as const, siteName: SITE_NAME, locale: "en_IN", title, description, url: path, images: ogImages },
    twitter: { card: "summary_large_image" as const, title, description, images: ogImages.map((i) => i.url) },
  };
}
