"use client";
// Ported from the original static site (legacy-static/app.jsx).
// The page switch (<body data-page>) is replaced by Next.js routes: each page
// renders its sections as `children` inside this shell.
import { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import { usePathname } from "next/navigation";
import { useScrollProgress } from "./primitives";
import { Header } from "./header";
import { Footer } from "./footer";
import { CartDrawer } from "./cart-drawer";
import { useBump, useCartLines } from "./shop-state";
import { useCartStore } from "@/lib/cart";
import { prefersReducedMotion } from "./use-dialog";

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "plum",
  "fontPair": "bricolage-geist",
  "density": "regular",
  "radius": "round",
  "dark": false
}/*EDITMODE-END*/;

function applyPalette(name) {
  const root = document.documentElement;
  // Each palette overrides the canonical --joy-* role tokens consumed throughout
  // the app. All options stay light enough that the deep ink text on brand reads.
  const palettes = {
    "plum": {
      "--joy-500": "oklch(.780 .122 306)",
      "--joy-600": "oklch(.665 .135 304)",
      "--joy-700": "oklch(.560 .140 303)",
      "--joy-950": "oklch(.235 .060 300)",
      "--brand": "oklch(.780 .122 306)",
      "--brand-press": "oklch(.665 .135 304)",
      "--brand-ink": "oklch(.235 .060 300)",
    },
    "lavender": {
      "--joy-500": "oklch(.825 .088 300)",
      "--joy-600": "oklch(.710 .110 300)",
      "--joy-700": "oklch(.580 .120 300)",
      "--joy-950": "oklch(.250 .055 300)",
      "--brand": "oklch(.825 .088 300)",
      "--brand-press": "oklch(.710 .110 300)",
      "--brand-ink": "oklch(.250 .055 300)",
    },
    "blush": {
      "--joy-500": "oklch(.805 .105 350)",
      "--joy-600": "oklch(.695 .135 352)",
      "--joy-700": "oklch(.565 .150 354)",
      "--joy-950": "oklch(.250 .062 350)",
      "--brand": "oklch(.805 .105 350)",
      "--brand-press": "oklch(.695 .135 352)",
      "--brand-ink": "oklch(.250 .062 350)",
    },
    "mauve": {
      "--joy-500": "oklch(.775 .080 330)",
      "--joy-600": "oklch(.660 .095 330)",
      "--joy-700": "oklch(.545 .105 330)",
      "--joy-950": "oklch(.245 .055 330)",
      "--brand": "oklch(.775 .080 330)",
      "--brand-press": "oklch(.660 .095 330)",
      "--brand-ink": "oklch(.245 .055 330)",
    },
  };
  const p = palettes[name] || palettes["plum"];
  Object.entries(p).forEach(([k, v]) => root.style.setProperty(k, v));
}

function applyFontPair(name) {
  const root = document.documentElement;
  const pairs = {
    "bricolage-geist": {
      display: `"Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif`,
      body: `"Geist", "Inter Tight", ui-sans-serif, system-ui, sans-serif`,
      mono: `"Geist Mono", ui-monospace, Menlo, monospace`,
    },
    "geist-only": {
      display: `"Geist", ui-sans-serif, sans-serif`,
      body: `"Geist", ui-sans-serif, sans-serif`,
      mono: `"Geist Mono", ui-monospace, Menlo, monospace`,
    },
  };
  const p = pairs[name] || pairs["bricolage-geist"];
  root.style.setProperty("--font-display", p.display);
  root.style.setProperty("--font-body", p.body);
  root.style.setProperty("--font-mono", p.mono);
}

function applyDensity(name) {
  const root = document.documentElement;
  if (name === "compact") {
    root.style.setProperty("--s-9", "64px");
    root.style.setProperty("--s-7", "32px");
  } else if (name === "comfy") {
    root.style.setProperty("--s-9", "144px");
    root.style.setProperty("--s-7", "64px");
  } else {
    root.style.setProperty("--s-9", "96px");
    root.style.setProperty("--s-7", "48px");
  }
}

function applyRadius(name) {
  const root = document.documentElement;
  if (name === "sharp") {
    root.style.setProperty("--r-3", "4px");
    root.style.setProperty("--r-4", "6px");
    root.style.setProperty("--r-5", "8px");
  } else if (name === "soft") {
    root.style.setProperty("--r-3", "10px");
    root.style.setProperty("--r-4", "14px");
    root.style.setProperty("--r-5", "20px");
  } else {
    root.style.setProperty("--r-3", "12px");
    root.style.setProperty("--r-4", "18px");
    root.style.setProperty("--r-5", "26px");
  }
}


export function SiteShell({ children }) {
  const t = TWEAK_DEFAULTS;
  const cart = useCartLines();
  const cartOpen = useCartStore((s) => s.isOpen);
  const openCart = useCartStore((s) => s.openCart);
  const closeCart = useCartStore((s) => s.closeCart);
  const handleRemove = useCartStore((s) => s.removeItem);
  const bump = useBump();
  const pathname = usePathname();

  // Theme: persisted, defaults to the OS preference on first visit.
  // ThemeScript (root layout) already applied it before paint; read it back here.
  const [dark, setDark] = useState(null);
  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);
  // Theme switch: the page cross-fades through the View Transitions API where
  // it exists; elsewhere colours ease across for one beat (html.theme-anim).
  // Instant under reduced motion. Styles: styles/motion.css.
  const toggleTheme = () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") !== "dark";
    const apply = () => {
      root.setAttribute("data-theme", next ? "dark" : "light");
      flushSync(() => setDark(next));
    };
    if (prefersReducedMotion()) { apply(); return; }
    if (typeof document.startViewTransition === "function") {
      root.setAttribute("data-vt", "theme");
      const vt = document.startViewTransition(apply);
      vt.finished.finally(() => root.removeAttribute("data-vt"));
      return;
    }
    root.classList.add("theme-anim");
    apply();
    window.setTimeout(() => root.classList.remove("theme-anim"), 360);
  };
  const progress = useScrollProgress();

  // Apply tweaks live
  useEffect(() => { applyPalette(t.palette); }, [t.palette]);
  useEffect(() => { applyFontPair(t.fontPair); }, [t.fontPair]);
  useEffect(() => { applyDensity(t.density); }, [t.density]);
  useEffect(() => { applyRadius(t.radius); }, [t.radius]);
  useEffect(() => {
    if (dark === null) return;
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try { localStorage.setItem("lav.theme", dark ? "dark" : "light"); } catch (e) { /* no-op */ }
  }, [dark]);

  const cartCount = cart.reduce((s, l) => s + l.qty, 0);

  return (
    <div className="app">
      <div className="progress-bar" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />

      <Header cartCount={cartCount} onOpenCart={openCart} bump={bump} dark={!!dark} onToggleTheme={toggleTheme} current={pathname} />

      {children}

      <Footer dark={!!dark} onToggleTheme={toggleTheme} />

      <CartDrawer
        open={cartOpen}
        onClose={closeCart}
        lines={cart}
        onRemove={handleRemove}
      />
    </div>
  );
}
