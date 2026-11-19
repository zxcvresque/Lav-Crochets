"use client";
import { useState, useRef } from "react";
import { Icon, useScrolled, BrandMark } from "./primitives";
import { CONFIG } from "./data";
import { useDialog } from "./use-dialog";
// Ported from the original static site (legacy-static/header.jsx).

// Primary nav: the two shop sections, custom orders, then about + contact.
export const NAV = [
  { href: "/ready-to-ship", label: "Ready to ship" },
  { href: "/made-to-order", label: "Made to order" },
  { href: "/custom", label: "Custom order" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
// header.jsx — Scroll-shrinking nav.
// Mobile (≤768): hamburger button replaces the nav links and opens a
// slide-in drawer with the primary nav.

function Wordmark() {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 0 }}>
      <span>{CONFIG.wordmarkA}</span><span className="name-d">{CONFIG.wordmarkB}</span>
    </span>
  );
}

export function MobileNavDrawer({ open, onClose, onOpenCart, dark, onToggleTheme }) {
  const drawerRef = useRef(null);
  const scrimRef = useRef(null);
  const closeRef = useRef(null);
  useDialog({
    open, onClose,
    containerRef: drawerRef,
    initialFocusRef: closeRef,
    keepRefs: [scrimRef],
    fallbackFocus: ".header .hamburger",
  });

  const shareShop = async () => {
    const url = (typeof location !== "undefined") ? location.origin + location.pathname : "";
    const data = { title: CONFIG.brandName, text: `${CONFIG.brandName} — ${CONFIG.tagline}`, url };
    try {
      if (navigator.share) await navigator.share(data);
      else if (navigator.clipboard) { await navigator.clipboard.writeText(url); }
    } catch (e) { /* cancelled / unsupported */ }
  };

  const sub = (icon, label) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
      <Icon name={icon} size={18} stroke={1.6} /><span>{label}</span>
    </span>
  );

  return (
    <>
      <div ref={scrimRef} className={`scrim ${open ? "open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside
        ref={drawerRef}
        id="mobile-nav-drawer"
        className={`mobile-nav-drawer ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        tabIndex={-1}
      >
        <div className="mobile-nav-head">
          <a href="/" className="brand" onClick={onClose} aria-label={`${CONFIG.brandName} home`}>
            <BrandMark size={26} />
            <Wordmark />
          </a>
          <button ref={closeRef} type="button" className="iconbtn focus-ring" onClick={onClose} aria-label="Close menu">
            <Icon name="x" size={20} />
          </button>
        </div>
        <nav className="mobile-nav-list" aria-label="Primary">
          {NAV.map((n) => <a key={n.href} href={n.href} onClick={onClose}>{n.label}</a>)}

          <hr className="mobile-nav-rule" aria-hidden="true" />

          <button className="mobile-nav-sub" onClick={() => { onClose(); onOpenCart && onOpenCart(); }}>
            {sub("cart", "Cart")}
          </button>
          <a className="mobile-nav-sub" href={CONFIG.instagramUrl} target="_blank" rel="noopener" onClick={onClose}>
            {sub("instagram", "Instagram")}
          </a>
          <button className="mobile-nav-sub" onClick={shareShop}>
            {sub("share", "Share this shop")}
          </button>
          <button className="mobile-nav-sub" onClick={onToggleTheme}>
            {sub(dark ? "sun" : "moon", dark ? "Light mode" : "Dark mode")}
          </button>
        </nav>
        <div className="mobile-nav-foot">
          <p className="mobile-nav-meta">Order online · Pay securely with Razorpay · Delivered in 4 to 5 days</p>
        </div>
      </aside>
    </>
  );
}

export function Header({ cartCount, onOpenCart, bump, dark, onToggleTheme, current }) {
  const scrolled = useScrolled(40);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <div className={`header-wrap ${scrolled ? "scrolled" : ""}`}>
        <div className="header">
          {/* Hamburger trigger — visible only on mobile (CSS-gated). Sits left. */}
          <button
            type="button"
            className="iconbtn hamburger focus-ring"
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" size={20} />
          </button>

          <a href="/" className="brand" aria-label={`${CONFIG.brandName} home`}>
            <BrandMark size={26} />
            <Wordmark />
          </a>

          <nav aria-label="Primary">
            {NAV.map((n) => <a key={n.href} href={n.href} aria-current={current === n.href ? "page" : undefined}>{n.label}</a>)}
          </nav>

          <div className="header-actions">
            <button className="iconbtn header-extra" onClick={onToggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
              <Icon name={dark ? "sun" : "moon"} size={18} />
            </button>
            <a className="iconbtn header-extra" href={CONFIG.instagramUrl} target="_blank" rel="noopener" aria-label="Instagram">
              <Icon name="instagram" size={18} />
            </a>
            <button
              type="button"
              className="iconbtn"
              aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
              aria-haspopup="dialog"
              aria-controls="cart-drawer"
              data-cart-trigger=""
              onClick={onOpenCart}
            >
              <Icon name="cart" size={18} />
              <span className={`cart-count ${cartCount === 0 ? "empty" : ""} ${bump ? "bump" : ""}`} aria-live="polite">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            </button>
          </div>
        </div>
      </div>
      <MobileNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} onOpenCart={onOpenCart} dark={dark} onToggleTheme={onToggleTheme} />
    </>
  );
}

