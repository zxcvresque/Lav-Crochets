"use client";
import { useState } from "react";
import { Icon, BrandMark } from "./primitives";
import { CONFIG } from "./data";
// Ported from the original static site (legacy-static/footer.jsx).
// footer.jsx — Editorial footer with mega-wordmark and link columns.

export function Footer({ dark, onToggleTheme }) {
  // On mobile the link columns collapse into tap-to-open accordion rows
  // (desktop shows them expanded — the chevron + collapse are CSS-gated to
  // the mobile breakpoint). `open` tracks which column is expanded.
  const [open, setOpen] = useState({});
  const toggle = (i) => setOpen((o) => ({ ...o, [i]: !o[i] }));
  const cols = [
    { h: "Shop", links: [
      { t: "All pieces", href: "/shop" },
      { t: "Ready to ship", href: "/ready-to-ship" },
      { t: "Made to order", href: "/made-to-order" },
      { t: "Bag charms", href: "/shop?cat=charms" },
      { t: "Hair accessories", href: "/shop?cat=hair" },
      { t: "Keychains", href: "/shop?cat=keychains" },
    ]},
    { h: "Make", links: [
      { t: "Custom orders", href: "/custom" },
      { t: "How ordering works", href: "/#story" },
      { t: "About the studio", href: "/about" },
    ]},
    { h: "Help", links: [
      { t: "Track your order", href: "/track" },
      { t: "Shipping", href: "/shipping" },
      { t: "Returns", href: "/returns" },
      { t: "Privacy", href: "/privacy" },
      { t: "Terms", href: "/terms" },
    ]},
    { h: "Connect", links: [
      { t: "Contact", href: "/contact" },
      { t: `Instagram ${CONFIG.instagramHandle}`, href: CONFIG.instagramUrl, ext: true },
      { t: "Email me", href: `mailto:${CONFIG.supportEmail}` },
    ]},
  ];
  return (
    <footer className="footer" id="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="row footer-brand">
              <BrandMark size={36} />
              <div className="font-display footer-wordmark">
                {CONFIG.wordmarkA}<span className="footer-wordmark-b">{CONFIG.wordmarkB}</span>
              </div>
            </div>
            <p className="footer-blurb">
              A little crochet studio in {CONFIG.city}. Every piece is hooked by hand. Order online, pay securely with Razorpay (UPI, cards, netbanking), delivered in 4 to 5 days.
            </p>

            <a href="/ready-to-ship" className="btn footer-cta">
              Shop ready-to-ship <Icon name="arrow" size={14} />
            </a>
          </div>

          {cols.map((c, i) => (
            <div className={`footer-col ${open[i] ? "open" : ""}`} key={c.h}>
              <button
                type="button"
                className="footer-col-head"
                aria-expanded={!!open[i]}
                onClick={() => toggle(i)}
              >
                <h4>{c.h}</h4>
                <Icon name="chev-down" size={18} className="footer-chev" />
              </button>
              <ul>
                {c.links.map((l) => (
                  <li key={l.t}>
                    {l.ext
                      ? <a href={l.href} target="_blank" rel="noopener">{l.t}</a>
                      : <a href={l.href}>{l.t}</a>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-note">
            <span>© 2026 {CONFIG.brandName}.</span>
            <span className="footer-bottom-sep" aria-hidden="true">·</span>
            <span>{CONFIG.shippingNote}</span>
          </div>
          <div className="footer-bottom-icons">
            <button type="button" className="footer-icon" onClick={onToggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
              <Icon name={dark ? "sun" : "moon"} size={16} />
            </button>
            <a className="footer-icon" href={CONFIG.instagramUrl} target="_blank" rel="noopener" aria-label="Instagram">
              <Icon name="instagram" size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

