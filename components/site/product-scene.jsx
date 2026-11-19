"use client";
// Ported from the original static site (legacy-static/product-scene.jsx).
import { Icon, Reveal, fmtPriceINR } from "./primitives";
import { CONFIG, CATEGORIES, ProductArt } from "./data";
import { useAddToCart, useAddWithFeedback } from "./shop-state";
// product-scene.jsx — Embedded /products/[slug] scene.
// Big editorial type, square art, detail block, order CTAs.

/** @param {{ product: any, categories?: { id: string, title: string }[] }} props */
export function ProductScene({ product, categories = CATEGORIES }) {
  const onAdd = useAddToCart();
  const { added, touched, add, openCart } = useAddWithFeedback();
  const buyNow = () => { onAdd(product); window.location.href = "/checkout"; };
  const ready = product.stockStatus === "ready";
  const onSale = product.wasINR && product.wasINR > product.priceINR;
  const local = fmtPriceINR(product.priceINR);
  const compare = onSale ? fmtPriceINR(product.wasINR) : null;
  const catTitle = (categories.find(c => c.id === product.category) || {}).title || "Shop";

  return (
    <section className="section" id="product">
      <div className="wrap">
        <Reveal>
          <div className="eyebrow pd-crumbs">
            <a href="/">{CONFIG.brandName}</a>
            <span className="sep" aria-hidden="true">/</span>
            <a href={ready ? "/ready-to-ship" : "/made-to-order"}>{ready ? "Ready to ship" : "Made to order"}</a>
            <span className="sep" aria-hidden="true">/</span>
            <a href={`/shop?cat=${product.category}`}>{catTitle}</a>
            <span className="sep" aria-hidden="true">/</span>
            <span className="here">{product.title}</span>
          </div>
        </Reveal>

        <div className="pd">
          <Reveal>
            <div className="pd-image">
              <ProductArt p={product} priority sizes="(max-width: 900px) calc(100vw - 32px), 52vw" />
              <div className="pd-chips">
                {product.chip === "pick" && <span className="chip pick">BESTSELLER</span>}
                {product.chip === "new" && <span className="chip new">NEW</span>}
                {product.chip === "sale" && <span className="chip sale">SALE</span>}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="pd-info">
              <h1>{product.title}</h1>
              <p className="pd-sub">{product.description}</p>

              <div className="price-detail">
                <span>{local}</span>
                {compare && <span className="usd">{compare}</span>}
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

              <div className="pd-buy">
                <button
                  className={`btn xl${added ? " is-added" : ""}${touched ? " has-fb" : ""}`}
                  onClick={() => (added ? openCart() : add(product))}
                >
                  <span aria-live="polite" className="add-fb-label" key={added ? "added" : "idle"}>
                    {added ? <><Icon name="check" size={16} stroke={2} /> Added · View cart</> : <>Add to cart <Icon name="arrow" size={16} /></>}
                  </span>
                </button>
                <button className="btn xl outline" onClick={buyNow}>
                  Buy now
                </button>
              </div>
              <p className="pd-note">
                Shipping included. Pay securely with Razorpay (UPI, cards, netbanking).
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

