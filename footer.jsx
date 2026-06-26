// footer.jsx — Editorial footer with mega-wordmark and link columns.

function Footer({ dark, onToggleTheme }) {
  const wa = `https://wa.me/${CONFIG.whatsappNumber}`;
  const cols = [
    { h: "Shop", links: [
      { t: "All pieces", href: "shop.html" },
      { t: "Bag charms", href: "shop.html?cat=charms" },
      { t: "Hair accessories", href: "shop.html?cat=hair" },
      { t: "Keychains", href: "shop.html?cat=keychains" },
    ]},
    { h: "Make", links: [
      { t: "Custom orders", href: "custom.html" },
      { t: "How ordering works", href: "index.html#story" },
      { t: "About the studio", href: "index.html#story" },
    ]},
    { h: "Connect", links: [
      { t: "Message on WhatsApp", href: wa, ext: true },
      { t: `Instagram ${CONFIG.instagramHandle}`, href: CONFIG.instagramUrl, ext: true },
      { t: "Email us", href: `mailto:${CONFIG.supportEmail}` },
    ]},
  ];
  return (
    <footer className="footer" id="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="row" style={{ marginBottom: 18 }}>
              <BrandMark size={36} />
              <div className="font-display" style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em" }}>
                {CONFIG.wordmarkA}<span style={{ opacity: 0.55 }}>{CONFIG.wordmarkB}</span>
              </div>
            </div>
            <p style={{ color: "color-mix(in oklch, var(--paper) 72%, transparent)", maxWidth: "44ch", fontSize: 15, lineHeight: 1.5 }}>
              A little crochet studio in {CONFIG.city}. Every piece is hooked by hand. Order on WhatsApp, pay by UPI, delivered in 4 to 5 days.
            </p>

            <a href={wa} target="_blank" rel="noopener" className="btn" style={{ marginTop: 24 }}>
              Order on WhatsApp <Icon name="arrow" size={14} />
            </a>
          </div>

          {cols.map((c) => (
            <div key={c.h}>
              <h4>{c.h}</h4>
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
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span>© 2026 {CONFIG.brandName}.</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>{CONFIG.shippingNote}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={onToggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} style={{ display: "inline-flex", background: "transparent", border: 0, padding: 0, cursor: "pointer", color: "inherit", opacity: 0.85 }}>
              <Icon name={dark ? "sun" : "moon"} size={16} />
            </button>
            <a href={CONFIG.instagramUrl} target="_blank" rel="noopener" aria-label="Instagram" style={{ display: "inline-flex", opacity: 0.85 }}>
              <Icon name="instagram" size={16} />
            </a>
            <a href={wa} target="_blank" rel="noopener" aria-label="WhatsApp" style={{ display: "inline-flex", opacity: 0.85 }}>
              <WaIcon size={16} />
            </a>
          </div>
        </div>

        {/* Mega wordmark moment */}
        <div className="megaword" aria-hidden="true">
          {CONFIG.wordmarkA}<em>{CONFIG.wordmarkB}</em>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Footer });
