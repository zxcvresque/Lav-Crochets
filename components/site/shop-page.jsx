"use client";
import { useState } from "react";
import { withCounts } from "./data";
import { SectionHead } from "./section-head";
import { ProductCard } from "./product-card";

// ── Shop page (shop.html) ─────────────────────────────────────────────
const SHOP_SECTIONS = {
  all: { title: <>Every piece, <em>hooked by hand.</em></> },
  ready: { title: <>Ready to ship. <em>Delivered in 4 to 5 days.</em></> },
  "made-to-order": { title: <>Made for you, <em>hooked to order.</em></> },
};

export function ShopPage({ products, onAdd = undefined, initialCat = "all", section = "all" }) {
  // Filters list only collections with pieces in this section.
  const collections = withCounts(products);
  const [cat, setCat] = useState(collections.some((c) => c.id === initialCat) ? initialCat : "all");
  // Once a filter is picked, the grid remounts per filter and its cards settle in.
  const [picked, setPicked] = useState(false);
  const head = SHOP_SECTIONS[section] || SHOP_SECTIONS.all;
  const filtered = cat === "all" ? products : products.filter(p => p.category === cat);
  return (
    <section className="section page-top" id="shop">
      <div className="wrap">
        <SectionHead
          level={1}
          title={head.title}
        />
        <div className="shop-filters" role="group" aria-label="Filter by collection">
          {[{ id: "all", title: "All", count: products.length }, ...collections].map(c => (
            <button
              key={c.id}
              type="button"
              className={`shop-filter ${cat === c.id ? "active" : ""}`}
              aria-pressed={cat === c.id}
              onClick={() => { setCat(c.id); setPicked(true); }}
            >{c.title}</button>
          ))}
        </div>
        <div className="pgrid" key={picked ? cat : "initial"} data-filtered={picked ? "" : undefined}>
          {filtered.map((p, i) => <ProductCard key={p.id} p={p} onAdd={onAdd} priority={i < 4} />)}
        </div>
        {filtered.length === 0 && (
          <p className="shop-empty">Nothing here yet, check another collection.</p>
        )}
      </div>
    </section>
  );
}
