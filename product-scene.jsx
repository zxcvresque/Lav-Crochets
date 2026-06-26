// product-scene.jsx — Embedded /products/[slug] scene.
// Big editorial type, square art, detail block, order CTAs.

function ProductScene({ product, onAdd }) {
  const ready = product.stockStatus === "ready";
  const onSale = product.wasINR && product.wasINR > product.priceINR;
  const local = fmtPriceINR(product.priceINR);
  const compare = onSale ? fmtPriceINR(product.wasINR) : null;
  const catTitle = (CATEGORIES.find(c => c.id === product.category) || {}).title || "Shop";

  return (
    <section className="section" id="product" style={{ background: "var(--bg)" }}>
      <div className="wrap">
        <Reveal>
          <div className="eyebrow" style={{ marginBottom: 20, display: "inline-flex", gap: 8 }}>
            <a href="#top">{CONFIG.brandName}</a>
            <span style={{ opacity: 0.5 }}>/</span>
            <a href="#shop">Shop</a>
            <span style={{ opacity: 0.5 }}>/</span>
            <a href="#categories">{catTitle}</a>
            <span style={{ opacity: 0.5 }}>/</span>
            <span style={{ color: "var(--fg)" }}>{product.title}</span>
          </div>
        </Reveal>

        <div className="pd">
          <Reveal>
            <div className="pd-image">
              <ProductArt p={product} />
              <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8 }}>
                {product.chip === "pick" && <span className="chip pick">BESTSELLER</span>}
                {product.chip === "new" && <span className="chip new">NEW</span>}
                {product.chip === "sale" && <span className="chip sale">SALE</span>}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div style={{ position: "sticky", top: 120 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>
                <span className="eyebrow-dot" />{ready ? "Ready to ship" : "Handmade to order"}
              </div>
              <h1>{product.title}</h1>
              <p className="pd-sub">{product.description}</p>

              <div className="price-detail">
                <span>{local}</span>
                {compare && <span className="usd" style={{ textDecoration: "line-through" }}>{compare}</span>}
              </div>

              <div className="file-meta">
                <div><div className="k">Materials</div><div className="v">{product.materials}</div></div>
                <div><div className="k">Size</div><div className="v">{(product.sizeOptions || []).join(", ")}</div></div>
                <div><div className="k">Colours</div><div className="v">{(product.colorOptions || []).join(", ")}</div></div>
                <div><div className="k">Availability</div><div className="v">{ready ? "Ready to ship" : "Made to order"} · {product.turnaround}</div></div>
                <div><div className="k">Care</div><div className="v">{product.care}</div></div>
              </div>

              <ul className="pd-features">
                <li>Hand-crocheted, no two are exactly alike.</li>
                <li>Skin-friendly cotton yarn.</li>
                <li>Custom colours and sizes on request.</li>
                <li>Carefully packed and posted, delivered in 4 to 5 days.</li>
              </ul>

              <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 28 }}>
                <button className="btn xl" onClick={() => onAdd(product)} style={{ flex: 1 }}>
                  Add to cart <Icon name="arrow" size={16} />
                </button>
                <a className="btn xl outline" href={buildProductWhatsAppHref(product)} target="_blank" rel="noopener" style={{ flex: 1, justifyContent: "center" }}>
                  Order on WhatsApp
                </a>
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-muted)", marginTop: 14, letterSpacing: "0.02em" }}>
                Price is for the crochet only. Shipping is confirmed on WhatsApp.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { ProductScene });
