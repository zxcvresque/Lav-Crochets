"use client";
// Home page sections (app/(site)/page.tsx): curated row, shop paths,
// collections, custom orders, quote + ordering timeline, Instagram, signup.
import { useState, useEffect, useRef } from "react";
import { Icon, Reveal } from "./primitives";
import { CONFIG, CATEGORIES, PrintArt } from "./data";
import { SectionHead } from "./section-head";
import { ProductCard } from "./product-card";
import { useImageFade } from "./use-image-fade";

// ── Curated row (home) ────────────────────────────────────────────────
// One row of distinct pieces: one per category first, then fill, never a
// repeated title. Replaces the featured / ready / made-to-order trio on home.
export function CuratedRow({ products, count = 4 }) {
  const seen = new Set();
  const cats = new Set();
  const picks = [];
  const key = (p) => (p.title || p.slug || "").trim().toLowerCase();
  for (const p of products) {
    if (picks.length >= count) break;
    if (seen.has(key(p)) || cats.has(p.category)) continue;
    seen.add(key(p)); cats.add(p.category); picks.push(p);
  }
  for (const p of products) {
    if (picks.length >= count) break;
    if (seen.has(key(p))) continue;
    seen.add(key(p)); picks.push(p);
  }
  if (picks.length === 0) return null;
  return (
    <section className="section" id="shop">
      <div className="wrap">
        <SectionHead
          title={<>Handmade pieces,<br/><em>ready to love.</em></>}
          action={<a className="btn ghost" href="/shop">Shop all <Icon name="arrow" size={14} /></a>}
        />
        <div className="pgrid">
          {picks.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  );
}

// ── Shop paths (home) ─────────────────────────────────────────────────
// Three ways in, each named by what it promises. Counts are live.
export function ShopPaths({ products }) {
  const ready = products.filter(p => p.stockStatus === "ready").length;
  const mto = products.length - ready;
  const paths = [
    { href: "/ready-to-ship", title: "Ready to ship", body: "Already made, delivered in 4 to 5 days.", count: ready },
    { href: "/made-to-order", title: "Made to order", body: "Hooked just for you. Your colours welcome.", count: mto },
    { href: "/shop", title: "Shop all", body: "Every charm, clip, headband and keychain.", count: products.length },
  ];
  return (
    <section className="section tight" id="ways-to-shop">
      <div className="wrap">
        <div className="shop-paths">
          {paths.map(x => (
            <a key={x.href} className="shop-path" href={x.href}>
              <span className="shop-path-count">{x.count} {x.count === 1 ? "piece" : "pieces"}</span>
              <span className="shop-path-title">{x.title}</span>
              <span className="shop-path-body">{x.body}</span>
              <span className="shop-path-arrow" aria-hidden="true"><Icon name="arrow" size={18} /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Category grid ─────────────────────────────────────────────────────
export function CategoryGrid({ categories = CATEGORIES }) {
  // Only collections that actually have pieces (counts come from real products).
  const visible = categories.filter((c) => (c.count || 0) > 0);
  if (visible.length === 0) return null;
  const tileBg = (tone) => {
    switch (tone) {
      case "joy":   return { bg: "var(--joy-500)",   fg: "var(--joy-950)" };
      case "sun":   return { bg: "var(--sun-500)",   fg: "var(--joy-950)" };
      case "plum":  return { bg: "var(--iris-500)",  fg: "white" };
      case "coral": return { bg: "var(--rose-500)", fg: "white" };
      case "paper": return { bg: "var(--paper-3)",   fg: "var(--joy-950)" };
      case "ink":   return { bg: "var(--ink)",       fg: "var(--joy-500)" };
      default: return { bg: "var(--bg-elev)", fg: "var(--fg)" };
    }
  };
  const arts = {
    charms:    <g opacity=".16" fill="currentColor"><circle cx="300" cy="312" r="92"/><rect x="293" y="184" width="14" height="58" rx="7"/><circle cx="300" cy="176" r="24" fill="none" stroke="currentColor" strokeWidth="9"/></g>,
    hair:      <g opacity=".16" fill="currentColor">{[0,72,144,216,288].map(a => { const r = a*Math.PI/180; return <circle key={a} cx={+(300+72*Math.cos(r)).toFixed(3)} cy={+(300+72*Math.sin(r)).toFixed(3)} r="46"/>; })}<circle cx="300" cy="300" r="40"/></g>,
    keychains: <g opacity=".18" fill="none" stroke="currentColor" strokeWidth="8"><circle cx="300" cy="330" r="74"/><circle cx="300" cy="208" r="30"/></g>,
    cases:     <g opacity=".18" fill="none" stroke="currentColor" strokeWidth="8"><rect x="214" y="236" width="172" height="128" rx="40"/><path d="M232 268 H368"/><circle cx="300" cy="196" r="24"/></g>,
  };
  return (
    <section className="section" id="categories">
      <div className="wrap">
        <SectionHead
          title={<>The whole studio,<br/><em>sorted by what you love.</em></>}
        />
        <div className={`cat-grid ${visible.length === 4 ? "four" : ""}`}>
          {visible.map((c, i) => {
            const s = tileBg(c.tone);
            return (
              <Reveal key={c.id} delay={i * 60} className="cat-tile" as="a" href={`/shop?cat=${c.id}`} style={{ background: s.bg, color: s.fg }}>
                <div className="tile-bg" style={{ color: s.fg }}>
                  <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
                    {arts[c.id]}
                  </svg>
                </div>
                <div className="tile-fg">
                  <span className="count">{c.count} {c.count === 1 ? "piece" : "pieces"}</span>
                  <div className="tile-row">
                    <h3>{c.title}</h3>
                    <span className="cat-arrow" aria-hidden="true">
                      <Icon name="arrow-up-right" size={18} />
                    </span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Custom orders ─────────────────────────────────────────────────────
export function CustomOrders() {
  return (
    <section className="section" id="custom">
      <div className="wrap">
        <div className="panel brand panel-split">
          <div>
            <h2 className="panel-headline">
              Have something<br/>in mind? Let's make it.
            </h2>
            <p className="panel-copy">
              Pick your colours and the piece you dream of, a plushie of your pet, a charm of your favourite
              character, a bouquet for a gift. Send me a message and I'll plan the design, timing and price with you.
            </p>
          </div>
          <div className="panel-actions">
            <a href="/custom" className="btn xl ink">
              Start a custom order <Icon name="arrow" size={16} />
            </a>
            <a href={CONFIG.instagramUrl} target="_blank" rel="noopener" className="btn xl outline">
              See custom work on Instagram
            </a>
            <p className="panel-note">Pay securely with Razorpay · Making time confirmed by email
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── How-ordering-works steps (scroll-lit timeline) ────────────────────
const ORDER_STEPS = [
  "Browse and pick your pieces.",
  "Add them to your cart and check out.",
  "Pay securely with Razorpay (UPI, cards, netbanking).",
  "I confirm your order by email.",
  "I hook it by hand and ship it to you.",
];

// Scroll-driven ordered list. As the section scrolls past an activation line,
// each numbered point lights up in turn (1 -> 5) and stays lit; the current
// point gets a filled "active" dot. On mobile each step is a card that reveals
// as it scrolls in. `seen` is monotonic (points stay lit / cards stay shown);
// `active` tracks the current point both ways.
export function OrderSteps() {
  const olRef = useRef(null);
  const [seen, setSeen] = useState(0);
  const [active, setActive] = useState(-1);
  // Set after the first measurement: only then may unlit mobile cards hide
  // (styles/pages/home.css), so server HTML always shows every step.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ol = olRef.current;
    if (!ol) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const line = window.innerHeight * 0.62;   // activation line
      const items = ol.children;
      let count = 0;
      for (let i = 0; i < items.length; i++) {
        // light a point once its badge centre rises above the line (badge ~34px)
        if (items[i].getBoundingClientRect().top + 17 <= line) count = i + 1;
      }
      setSeen((prev) => (count > prev ? count : prev));        // never un-light
      setActive((prev) => (prev === count - 1 ? prev : count - 1));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute); };
    compute();
    setReady(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <ol className="order-steps" ref={olRef} data-ready={ready ? "" : undefined}>
      {ORDER_STEPS.map((t, i) => (
        <li key={i} className={`order-step${i < seen ? " is-lit" : ""}${i === active ? " is-active" : ""}`}>
          <span className="order-step-num" aria-hidden="true">{i + 1}</span>
          <span className="order-step-text">{t}</span>
        </li>
      ))}
    </ol>
  );
}

// ── Quote / how it works ──────────────────────────────────────────────
export function QuoteBlock() {
  return (
    <section className="section" id="story">
      <div className="wrap">
        <div className="grid-2 story-grid">
          <Reveal>
            <p className="quote-block">
              I make pieces I would happily gift to someone I love. <em>Every stitch is by hand,</em> no two exactly alike, and your colours and sizes are always welcome.
            </p>
            <div className="quote-meta">
              <span>{CONFIG.brandName}</span>
              <span className="dot" aria-hidden="true" />
              <span>{CONFIG.city}</span>
              <span className="dot" aria-hidden="true" />
              <span>Hooked by hand</span>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="panel brand order-card">
              <h3 className="panel-title">How ordering works</h3>
              <OrderSteps />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── Instagram strip: latest 5 posts from @crochetsbylav ────────────────
// Live posts come from lib/instagram.ts (Instagram API, refreshed hourly).
// Each tile opens that post on Instagram. Without posts, soft art tiles link
// to the profile instead.
/** @param {{ posts?: { id?: string, img?: string, url?: string, caption?: string, kind?: string }[] }} props */
export function InstagramRow({ posts = [] }) {
  const fallbackArts = ["yarn", "flower", "granny", "stitch", "hearts"];
  const tiles = posts.length
    ? posts.slice(0, 5)
    : fallbackArts.map((v) => ({ art: v, url: CONFIG.instagramUrl }));
  return (
    <section className="section tight" id="instagram">
      <div className="wrap">
        <SectionHead
          title={<>Follow along on <em>{CONFIG.instagramHandle}</em></>}
          action={<a className="btn ghost" href={CONFIG.instagramUrl} target="_blank" rel="noopener">Open Instagram <Icon name="arrow-up-right" size={14} /></a>}
        />
        <ul className="ig-row">
          {tiles.map((post, i) => (
            <li key={post.id || i}>
              <a className="ig-tile" href={post.url || CONFIG.instagramUrl} target="_blank" rel="noopener"
                 aria-label={post.caption ? `Open on Instagram: ${post.caption.slice(0, 80)}` : "Open on Instagram"}>
                {post.img
                  ? <IgImage src={post.img} alt={post.caption ? post.caption.slice(0, 120) : "Instagram post by @crochetsbylav"} />
                  : <PrintArt variant={post.art} />}
                {post.kind === "VIDEO" && <span className="ig-kind" aria-hidden="true"><Icon name="play" size={14} /></span>}
                {post.kind === "CAROUSEL_ALBUM" && <span className="ig-kind" aria-hidden="true"><Icon name="share" size={14} /></span>}
                <span className="ig-hover" aria-hidden="true"><Icon name="instagram" size={22} /></span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function IgImage({ src, alt }) {
  const fade = useImageFade();
  return <img ref={fade.ref} className={fade.className} onLoad={fade.done} onError={fade.done} src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" />;
}

// ── Social signup ─────────────────────────────────────────────────────
export function Newsletter() {
  return (
    <section className="section tight" id="newsletter">
      <div className="wrap">
        <div className="panel ink panel-split">
          <div>
            <h2 className="panel-headline">
              New drops and restocks,<br/>
              <span className="panel-headline-em">first on Instagram.</span>
            </h2>
            <p className="panel-copy">
              I post fresh pieces, behind-the-scenes and custom work. Got a question about an order? Email me anytime.
            </p>
          </div>
          <div className="panel-actions">
            <a href={CONFIG.instagramUrl} target="_blank" rel="noopener" className="btn xl btn-flash compact">
              Follow on Instagram <Icon name="arrow-up-right" size={16} />
            </a>
            <a href={`mailto:${CONFIG.supportEmail}`} className="btn xl outline btn-flash compact">
              Email me
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
