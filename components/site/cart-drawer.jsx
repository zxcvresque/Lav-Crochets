"use client";
import { useState, useEffect, useRef } from "react";
import { Icon, fmtPriceINR } from "./primitives";
import { ProductArt } from "./data";
import { useCartStore } from "@/lib/cart";
import { useDialog, prefersReducedMotion } from "./use-dialog";
// Ported from the original static site (legacy-static/cart-drawer.jsx).
// cart-drawer.jsx — Slide-from-right cart drawer.
// Checkout = the online checkout at /checkout (Razorpay).

export function CartDrawer({ open, onClose, lines, onRemove }) {
  const drawerRef = useRef(null);
  const scrimRef = useRef(null);
  const closeRef = useRef(null);
  const headingRef = useRef(null);
  const undoRef = useRef(null);
  useDialog({
    open, onClose,
    containerRef: drawerRef,
    initialFocusRef: closeRef,
    keepRefs: [scrimRef],
    fallbackFocus: "[data-cart-trigger]",
  });

  const updateQuantity = useCartStore((s) => s.updateQuantity);
  // Last removed line, kept briefly so it can be put back where it was.
  const [removed, setRemoved] = useState(null);
  // Lines animating out (collapse) before they leave the store.
  const [leaving, setLeaving] = useState(() => new Set());
  const undoTimer = useRef(null);
  const leaveTimers = useRef([]);
  const focusUndo = useRef(false);
  useEffect(() => () => { clearTimeout(undoTimer.current); leaveTimers.current.forEach(clearTimeout); }, []);
  useEffect(() => { if (!open) { setRemoved(null); setLeaving(new Set()); } }, [open]);
  // After a removal the focused trash button is gone: move focus to Undo.
  useEffect(() => {
    if (removed && focusUndo.current && undoRef.current) {
      undoRef.current.focus({ preventScroll: true });
      focusUndo.current = false;
    }
  }, [removed]);

  const dismissUndo = () => {
    // Don't strand keyboard focus on a button that's about to disappear.
    if (undoRef.current && undoRef.current === document.activeElement && headingRef.current) {
      headingRef.current.focus({ preventScroll: true });
    }
    setRemoved(null);
  };

  const remove = (l, index) => {
    if (leaving.has(l.id)) return;
    const item = useCartStore.getState().items.find((i) => i.id === l.id);
    const finish = () => {
      setLeaving((s) => { const n = new Set(s); n.delete(l.id); return n; });
      onRemove(l.id);
      focusUndo.current = true;
      setRemoved(item ? { item, index } : null);
      if (!item && headingRef.current) headingRef.current.focus({ preventScroll: true });
      clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(dismissUndo, 6000);
    };
    if (prefersReducedMotion()) { finish(); return; }
    setLeaving((s) => new Set(s).add(l.id));
    leaveTimers.current.push(setTimeout(finish, 260));
  };
  const undo = () => {
    if (!removed) return;
    useCartStore.setState((st) => {
      if (st.items.some((i) => i.id === removed.item.id)) return st;
      const items = [...st.items];
      items.splice(Math.min(removed.index, items.length), 0, removed.item);
      return { items };
    });
    if (headingRef.current) headingRef.current.focus({ preventScroll: true });
    setRemoved(null);
    clearTimeout(undoTimer.current);
  };

  const subtotal = lines.reduce((s, l) => s + (l.priceINR || 0) * l.qty, 0);
  const total = fmtPriceINR(subtotal);

  return (
    <>
      <div ref={scrimRef} className={`scrim ${open ? "open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside
        ref={drawerRef}
        id="cart-drawer"
        className={`drawer ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        inert={!open}
        tabIndex={-1}
      >
        <div className="drawer-head">
          <h3 id="cart-drawer-title" ref={headingRef} tabIndex={-1}>Cart <span className="drawer-count">{lines.reduce((n, l) => n + l.qty, 0)} {lines.reduce((n, l) => n + l.qty, 0) === 1 ? "item" : "items"}</span></h3>
          <button ref={closeRef} type="button" className="iconbtn focus-ring" onClick={onClose} aria-label="Close cart">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="drawer-body">
          <div aria-live="polite">
            {removed && (
              <div className="cart-undo">
                <span className="cart-undo-text">Removed <strong>{removed.item.title}</strong></span>
                <button ref={undoRef} type="button" className="cart-undo-btn" onClick={undo}>Undo</button>
              </div>
            )}
          </div>
          {lines.length === 0 ? (
            <div className="drawer-empty">
              <div className="drawer-empty-title">
                <span className="font-italic">Empty for now.</span>
              </div>
              <p>
                Add a charm, a clip, or a little keychain to get started.
              </p>
              <a className="btn" href="/shop" onClick={onClose}>Browse the shop <Icon name="arrow" size={14}/></a>
            </div>
          ) : (
            lines.map((l, index) => {
              const lineTotal = fmtPriceINR((l.priceINR || 0) * l.qty);
              const ready = l.stockStatus === "ready";
              return (
                <div className={`cart-line-slot ${leaving.has(l.id) ? "leaving" : ""}`} key={l.id}>
                <div className="cart-line">
                  <div className="thumb"><ProductArt p={l} sizes="52px" /></div>
                  <div className="ct">
                    <div className="t">{l.title}</div>
                    <div className="m">{ready ? "Ready to ship" : "Made to order"}</div>
                    <div className="qty-stepper" role="group" aria-label={`Quantity for ${l.title}`}>
                      <button type="button" onClick={() => updateQuantity(l.id, l.qty - 1)} disabled={l.qty <= 1} aria-label={`Decrease quantity of ${l.title}`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>
                      </button>
                      <span className="qty-value" aria-live="polite" aria-atomic="true"><span className="sr-only">Quantity </span>{l.qty}</span>
                      <button type="button" onClick={() => updateQuantity(l.id, l.qty + 1)} disabled={l.qty >= 20} aria-label={`Increase quantity of ${l.title}`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
                      </button>
                    </div>
                  </div>
                  <div className="cart-line-right">
                    <div className="price">{lineTotal}</div>
                    <button type="button" className="cart-remove" onClick={() => remove(l, index)} aria-label={`Remove ${l.title}`} title="Remove">
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </div>
                </div>
              );
            })
          )}
        </div>

        {lines.length > 0 && (
          <div className="drawer-foot">
            <div className="cart-totals">
              <div className="row-t"><span>Subtotal (crochet)</span><span>{total}</span></div>
              <div className="row-t"><span>Shipping</span><span className="mono">Included</span></div>
              <div className="row-t grand"><span>Total</span><span>{total}</span></div>
            </div>

            <a href="/checkout" className="btn btn-flash cart-checkout">
              Checkout
              <Icon name="arrow" size={16} />
            </a>

            <p className="cart-foot-note">Pay securely with Razorpay (UPI, cards, netbanking). Have a coupon? Add it at checkout.</p>
          </div>
        )}
      </aside>
    </>
  );
}

