// header.jsx — Announcement bar + scroll-shrinking nav (Postily energy).
// Mobile (≤768): hamburger button replaces the nav links and opens a
// slide-in drawer with the primary nav.

function AnnouncementBar() {
  const scrolled = useScrolled(40);
  const items = [
    "Handmade crochet, made with love.",
    "Order on WhatsApp, pay by UPI.",
    "In-stock pieces restocked weekly.",
    "Custom colours and sizes welcome.",
    "Delivered in 4 to 5 days.",
  ];
  const seq = [...items, ...items, ...items];
  return (
    <div className={`announce ${scrolled ? "hidden" : ""}`} aria-label="Announcements">
      <div className="scroller">
        {seq.map((t, i) => (
          <span key={i} className="row" style={{ gap: 12, alignItems: "center" }}>
            <span className="star" aria-hidden="true">✦</span>
            <span>{t}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Wordmark() {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 0 }}>
      <span>{CONFIG.wordmarkA}</span><span className="name-d">{CONFIG.wordmarkB}</span>
    </span>
  );
}

function MobileNavDrawer({ open, onClose, onOpenCart, dark, onToggleTheme }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
      <div className={`scrim ${open ? "open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`mobile-nav-drawer ${open ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Primary navigation">
        <div className="mobile-nav-head">
          <a href="index.html" className="brand" onClick={onClose} aria-label={`${CONFIG.brandName} home`}>
            <BrandMark size={26} />
            <Wordmark />
          </a>
          <button className="iconbtn focus-ring" onClick={onClose} aria-label="Close menu">
            <Icon name="x" size={20} />
          </button>
        </div>
        <nav className="mobile-nav-list" aria-label="Primary">
          <a href="shop.html" onClick={onClose}>Shop</a>
          <a href="shop.html" onClick={onClose}>Collections</a>
          <a href="custom.html" onClick={onClose}>Custom Orders</a>
          <a href="about.html" onClick={onClose}>About</a>
          <a href="contact.html" onClick={onClose}>Contact</a>

          <hr className="mobile-nav-rule" aria-hidden="true" />

          <button className="mobile-nav-sub" onClick={() => { onClose(); onOpenCart && onOpenCart(); }}>
            {sub("cart", "Cart")}
          </button>
          <a className="mobile-nav-sub" href={CONFIG.instagramUrl} target="_blank" rel="noopener" onClick={onClose}>
            {sub("instagram", "Instagram")}
          </a>
          <a className="mobile-nav-sub" href={`https://wa.me/${CONFIG.whatsappNumber}`} target="_blank" rel="noopener" onClick={onClose}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
              <WaIcon size={18} /><span>WhatsApp</span>
            </span>
          </a>
          <button className="mobile-nav-sub" onClick={shareShop}>
            {sub("share", "Share this shop")}
          </button>
          <button className="mobile-nav-sub" onClick={onToggleTheme}>
            {sub(dark ? "sun" : "moon", dark ? "Light mode" : "Dark mode")}
          </button>
        </nav>
        <div className="mobile-nav-foot">
          <p className="mobile-nav-meta">Order on WhatsApp · Pay by UPI · Delivered in 4 to 5 days</p>
        </div>
      </aside>
    </>
  );
}

function Header({ cartCount, onOpenCart, bump, dark, onToggleTheme }) {
  const scrolled = useScrolled(40);
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <>
      <div className={`header-wrap ${scrolled ? "scrolled" : ""}`}>
        <div className="header">
          {/* Hamburger trigger — visible only on mobile (CSS-gated). Sits left. */}
          <button
            className="iconbtn hamburger focus-ring"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" size={20} />
          </button>

          <a href="index.html" className="brand" aria-label={`${CONFIG.brandName} home`}>
            <BrandMark size={26} />
            <Wordmark />
          </a>

          <nav aria-label="Primary">
            <a href="shop.html">Shop</a>
            <a href="shop.html">Collections</a>
            <a href="custom.html">Custom Orders</a>
            <a href="about.html">About</a>
            <a href="contact.html">Contact</a>
          </nav>

          <div className="header-actions">
            <button className="iconbtn header-extra" onClick={onToggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
              <Icon name={dark ? "sun" : "moon"} size={18} />
            </button>
            <a className="iconbtn header-extra" href={CONFIG.instagramUrl} target="_blank" rel="noopener" aria-label="Instagram">
              <Icon name="instagram" size={18} />
            </a>
            <a className="iconbtn header-extra" href={`https://wa.me/${CONFIG.whatsappNumber}`} target="_blank" rel="noopener" aria-label="Message on WhatsApp">
              <WaIcon size={18} />
            </a>
            <button className="iconbtn" aria-label={`Cart, ${cartCount} items`} onClick={onOpenCart}>
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

Object.assign(window, { AnnouncementBar, Header, MobileNavDrawer });
