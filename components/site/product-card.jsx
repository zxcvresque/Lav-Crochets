"use client";
import { Icon, fmtPriceINR } from "./primitives";
import { ProductArt } from "./data";
import { useAddWithFeedback } from "./shop-state";

// ── Product card ───────────────────────────────────────────────────────
// article > framed 1:1 image (chips + availability) / content (title, price,
// add). The title link stretches over the card, so the whole card opens the
// product; the add button sits above that overlay. Hover: the photo eases in
// a touch (or crossfades to a second photo), the card lifts and paints its box.
export function ProductCard({ p, onAdd: onAddProp = undefined, priority = false }) {
  const { added, touched, add, openCart } = useAddWithFeedback(onAddProp);
  const onAdd = add;
  const onSale = p.wasINR && p.wasINR > p.priceINR;
  const pct = onSale ? Math.round((1 - p.priceINR / p.wasINR) * 100) : null;
  const isPick = p.chip === "pick";
  const isNew = p.chip === "new" && !isPick;
  const ready = p.stockStatus === "ready";
  const local = fmtPriceINR(p.priceINR);
  const compare = onSale ? fmtPriceINR(p.wasINR) : null;
  const hasAlt = Boolean(p.img && p.img2);

  return (
    <article className={`pcard${hasAlt ? " has-alt" : ""}${p.img ? "" : " no-photo"}`}>
      <div className="pcard-image">
        <ProductArt p={p} hoverSwap priority={priority} />
        <span className="pcard-chips">
          {isPick && <span className="pcard-chip pcard-chip--pick">Bestseller</span>}
          {isNew && <span className="pcard-chip pcard-chip--free">New</span>}
          {onSale && <span className="pcard-chip pcard-chip--sale">{pct}% off</span>}
        </span>
        <span className={`pcard-avail pcard-avail--${ready ? "ready" : "mto"}`}>
          <span className="pcard-avail-dot" aria-hidden="true" />
          {ready ? "Ready to ship" : "Made to order"}
        </span>
      </div>

      <div className="pcard-content">
        <h3 className="pcard-title" title={p.title}>
          <a className="pcard-link-title" href={`/product/${p.slug}`}>{p.title}</a>
        </h3>
        <div className="pcard-price-row">
          <span className={`pcard-price${onSale ? " pcard-price--sale" : ""}`}>{local}</span>
          {onSale && <span className="pcard-price-compare"><span className="sr-only">was </span>{compare}</span>}
        </div>
        {onAdd && (
          <button
            type="button"
            className={`pcard-add${added ? " is-added" : ""}${touched ? " has-fb" : ""}`}
            onClick={() => (added ? openCart() : onAdd(p))}
            aria-label={added ? `${p.title} added to cart. View cart` : `Add ${p.title} to cart`}
          >
            <span aria-live="polite" className="add-fb-label" key={added ? "added" : "idle"}>
              {added ? <><Icon name="check" size={14} stroke={2} /> Added · View cart</> : <>Add to cart <Icon name="cart" size={14} /></>}
            </span>
          </button>
        )}
      </div>
    </article>
  );
}
