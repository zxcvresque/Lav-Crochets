"use client";
// Ported from the original static site (legacy-static/data.jsx).
// Products now come from the database (lib/catalog.ts); config + art stay here.
import React from "react";
import Image from "next/image";
import { useImageFade } from "./use-image-fade";

// ── Business config ─────────────────────────────────────────────────────
// One place for every brand/contact value. Swap the TODOs as they arrive.
export const CONFIG = {
  brandName: "Lav Crochets",
  wordmarkA: "lav",            // bold part of the split wordmark
  wordmarkB: "/crochets",      // muted part (same style as the original "/digital")
  tagline: "Handmade crochet, made with love.",
  city: "Chhatrapati Sambhajinagar, Maharashtra",


  // Payments run through Razorpay checkout (UPI, cards, netbanking); no UPI id/QR here.

  // Socials.
  instagramHandle: "@crochetsbylav",
  instagramUrl: "https://www.instagram.com/crochetsbylav",

  supportEmail: "hello@lav-crochets.art",
  shippingNote: "Most pieces are delivered in about 4 to 5 days. For custom pieces, I confirm the making time over email.",

  // Static Instagram grid (no API). TODO: add { img, url } tiles (drop thumbs in assets/).

};

// ── Collections ─────────────────────────────────────────────────────────
// Names and tones only. Counts are always derived from the real products
// (see withCounts below / categoriesFor in lib/catalog.ts), and a collection
// with no published pieces is hidden everywhere it would be listed.
export const CATEGORIES = [
  { id: "charms",    title: "Bag charms",       tone: "coral" },
  { id: "hair",      title: "Hair accessories", tone: "joy"   },
  { id: "keychains", title: "Keychains",        tone: "plum"  },
  { id: "cases",     title: "Pouches & cases",  tone: "sun"   },
];

/** Collections with live counts from `products`; empty collections dropped. */
export function withCounts(products, categories = CATEGORIES) {
  return categories
    .map((c) => ({ ...c, count: products.filter((p) => p.category === c.id).length }))
    .filter((c) => c.count > 0);
}

// ── Testimonials ────────────────────────────────────────────────────────
// PLACEHOLDER CONTENT: replace every entry below with real words from real
// customers (with their permission) before launch, then delete `placeholder`.
// Entries still marked `placeholder: true` show in development only and are
// never rendered in production. An empty array renders no section at all.
//   quote    what they said, in their words
//   name     how they'd like to be credited (first name + city is plenty)
//   piece    optional, what they bought
//   product  optional, product slug, so the quote can also show on that page
export const TESTIMONIALS = [
  {
    placeholder: true,
    quote: "PLACEHOLDER: paste a real customer's words here. Replace before launch.",
    name: "Customer name",
    city: "City",
    piece: "Piece they bought",
    product: "tulip-headband",
  },
  {
    placeholder: true,
    quote: "PLACEHOLDER: a second real review goes here, ideally about a custom order.",
    name: "Customer name",
    city: "City",
    piece: "Custom order",
  },
  {
    placeholder: true,
    quote: "PLACEHOLDER: a third real review goes here. Delete this entry if you only have two.",
    name: "Customer name",
    city: "City",
    piece: "Piece they bought",
    product: "spiderman-bag-charm",
  },
];

/** Testimonials safe to show: placeholders are dropped in production. */
export function liveTestimonials(list = TESTIMONIALS) {
  const prod = process.env.NODE_ENV === "production";
  return list.filter((t) => t && t.quote && !(prod && t.placeholder));
}

// PrintArt: soft, crochet-flavoured SVG placeholders that suggest a handmade
// piece without faking a photo. Background cycles through the brand palette.
export function PrintArt({ variant = "yarn", chip }) {
  const palettes = {
    "yarn":    { bg: "var(--joy-100)",  ink: "var(--joy-700)" },
    "flower":  { bg: "var(--rose-300)", ink: "var(--rose-700)" },
    "granny":  { bg: "var(--iris-300)", ink: "var(--iris-700)" },
    "stitch":  { bg: "var(--joy-200)",  ink: "var(--joy-800)" },
    "stripes": { bg: "var(--paper-3)",  ink: "var(--joy-700)" },
    "hearts":  { bg: "var(--sun-300)",  ink: "var(--rose-700)" },
    "bundle":  { bg: "var(--ink)",      ink: "var(--joy-300)" },
  };
  const p = palettes[variant] || palettes["yarn"];

  const layout = {
    // Ball of yarn with a loose curl.
    "yarn": (
      <g fill="none" stroke={p.ink} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="195" cy="205" r="120" strokeWidth="7" opacity=".8"/>
        <path d="M95 175 Q195 265 295 175" strokeWidth="5" opacity=".5"/>
        <path d="M100 240 Q195 170 290 250" strokeWidth="5" opacity=".5"/>
        <path d="M150 95 Q255 205 175 320" strokeWidth="5" opacity=".5"/>
        <path d="M300 250 C360 250 360 322 305 322 C272 322 272 286 305 286" strokeWidth="6" opacity=".7"/>
      </g>
    ),
    // A single crochet flower.
    "flower": (
      <g>
        {[0,60,120,180,240,300].map((a) => {
          const r = (a * Math.PI) / 180;
          const cx = +(200 + 78 * Math.cos(r)).toFixed(3);
          const cy = +(205 + 78 * Math.sin(r)).toFixed(3);
          return <circle key={a} cx={cx} cy={cy} r="52" fill={p.ink} opacity=".22"/>;
        })}
        <circle cx="200" cy="205" r="46" fill={p.ink} opacity=".7"/>
        <circle cx="200" cy="205" r="22" fill={p.bg}/>
      </g>
    ),
    // Four granny squares.
    "granny": (
      <g>
        {[[58,62],[230,62],[58,234],[230,234]].map(([x,y],i) => (
          <g key={i} transform={`translate(${x},${y})`}>
            <rect width="112" height="112" rx="10" fill="none" stroke={p.ink} strokeWidth="6" opacity=".7"/>
            <rect x="24" y="24" width="64" height="64" rx="8" fill="none" stroke={p.ink} strokeWidth="6" opacity=".5"/>
            <rect x="46" y="46" width="20" height="20" rx="5" fill={p.ink} opacity=".5"/>
          </g>
        ))}
      </g>
    ),
    // Chevron rows — ripple/V-stitch texture.
    "stitch": (
      <g stroke={p.ink} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity=".5">
        {[70,130,190,250,310,370].map((y, r) => (
          <g key={r}>
            {[0,1,2,3,4,5].map((c) => (
              <path key={c} d={`M${c*72} ${y} L${c*72+36} ${y-28} L${c*72+72} ${y}`}/>
            ))}
          </g>
        ))}
      </g>
    ),
    // Cozy blanket stripes.
    "stripes": (
      <g>
        {[...Array(8)].map((_, i) => (
          <rect key={i} x="0" y={i*50 + 6} width="400" height="34" fill={p.ink} opacity={0.14 + (i % 3) * 0.09}/>
        ))}
      </g>
    ),
    // Scattered hearts.
    "hearts": (
      <g fill={p.ink}>
        {[[110,130,1.1],[270,160,0.8],[170,255,1.3],[305,300,0.9],[80,310,0.7]].map(([x,y,s],i) => (
          <path key={i} transform={`translate(${x},${y}) scale(${s})`} opacity={0.3 + (i % 3) * 0.16}
            d="M0 4 C0 -4 -14 -8 -22 0 C-30 8 -22 18 0 34 C22 18 30 8 22 0 C14 -8 0 -4 0 4 Z"/>
        ))}
      </g>
    ),
    // Gift-set collage.
    "bundle": (
      <g>
        {[
          [40,40,150,90,"var(--joy-500)"],
          [210,40,150,150,"var(--rose-500)"],
          [40,150,150,210,"var(--iris-500)"],
          [210,210,150,150,"var(--sun-500)"],
        ].map(([x,y,w,h,c],i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="16" fill={c} opacity=".88"/>
        ))}
      </g>
    ),
  };

  return (
    <svg className="print-art" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="400" fill={p.bg}/>
      {layout[variant] || layout["yarn"]}
      {/* subtle paper grain */}
      <rect width="400" height="400" fill="url(#grain)"/>
      <defs>
        <pattern id="grain" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill="transparent"/>
          <circle cx="0.5" cy="0.5" r="0.5" fill={p.ink} opacity="0.025"/>
        </pattern>
      </defs>
    </svg>
  );
}

// Neutral stand-in for a product that has no photo yet: undyed-cotton
// surface, a quiet yarn-ball line drawing and a "photo coming soon" note.
// Uses theme tokens, so it reads as calm in both light and dark.
export function ProductPlaceholder({ label = "Photo coming soon" }) {
  return (
    <span className="product-ph" role="img" aria-label={label}>
      <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
        <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="56" cy="62" r="30" />
          <path d="M30 52 Q56 78 82 52" opacity=".6" />
          <path d="M31 72 Q56 50 81 74" opacity=".6" />
          <path d="M44 34 Q74 62 50 92" opacity=".6" />
          <path d="M84 74 C100 74 100 96 86 96 C77 96 77 86 86 86" />
        </g>
      </svg>
      <span className="product-ph-note" aria-hidden="true">{label}</span>
    </span>
  );
}

// next/image that fades in if it is still downloading after hydration.
export function FadeImage({ className = "", onLoad = undefined, onError = undefined, ...props }) {
  const fade = useImageFade();
  return (
    <Image
      ref={fade.ref}
      className={`${className} ${fade.className}`.trim()}
      onLoad={(e) => { fade.done(); onLoad && onLoad(e); }}
      onError={(e) => { fade.done(); onError && onError(e); }}
      {...props}
    />
  );
}

const srcOf = (img) => (img.startsWith("/") || img.startsWith("http") ? img : `/${img}`);

// Product artwork: the real photo through next/image (responsive srcset,
// lazy by default, `priority` for above-the-fold), else the neutral
// placeholder. `img2` (a second photo) crossfades in on card hover when present.
export function ProductArt({ p, sizes = "(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw", priority = false, hoverSwap = false }) {
  const [err, setErr] = React.useState(false);
  const [err2, setErr2] = React.useState(false);
  if (p && p.img && !err) {
    const second = hoverSwap && p.img2 && !err2;
    return (
      <span className="product-art">
        <FadeImage
          className="product-art-img"
          src={srcOf(p.img)}
          alt={p.title || ""}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setErr(true)}
        />
        {second && (
          <FadeImage
            className="product-art-img product-art-img--alt"
            src={srcOf(p.img2)}
            alt=""
            fill
            sizes={sizes}
            onError={() => setErr2(true)}
          />
        )}
      </span>
    );
  }
  return <ProductPlaceholder />;
}
