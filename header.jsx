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

function MobileNavDrawer({ open, onClose }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`scrim ${open ? "open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`mobile-nav-drawer ${open ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Primary navigation">
        <div className="mobile-nav-head">
          <a href="#top" className="brand" onClick={onClose} aria-label={`${CONFIG.brandName} home`}>
            <BrandMark size={26} />
            <Wordmark />
          </a>
          <button className="iconbtn focus-ring" onClick={onClose} aria-label="Close menu">
            <Icon name="x" size={20} />
          </button>
        </div>
        <nav className="mobile-nav-list" aria-label="Primary">
          <a href="#shop" onClick={onClose}>Shop</a>
          <a href="#categories" onClick={onClose}>Collections</a>
          <a href="#custom" onClick={onClose}>Custom Orders</a>
          <a href="#story" onClick={onClose}>About</a>
          <a href="#footer" onClick={onClose}>Contact</a>
          <hr className="mobile-nav-rule" aria-hidden="true" />
          <a href="#cart" onClick={onClose}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
              <Icon name="cart" size={20} stroke={1.6} />
              <span>Cart</span>
            </span>
          </a>
        </nav>
        <div className="mobile-nav-foot">
          <a href={`https://wa.me/${CONFIG.whatsappNumber}`} target="_blank" rel="noopener" className="btn xl ink" style={{ width: "100%", justifyContent: "center" }} onClick={onClose}>
            Order on WhatsApp
            <Icon name="arrow" size={16} />
          </a>
          <p className="mobile-nav-meta">Order on WhatsApp · Pay by UPI · Delivered in 4 to 5 days</p>
        </div>
      </aside>
    </>
  );
}

function Header({ cartCount, onOpenCart, bump }) {
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

          <a href="#top" className="brand" aria-label={`${CONFIG.brandName} home`}>
            <BrandMark size={26} />
            <Wordmark />
          </a>

          <nav aria-label="Primary">
            <a href="#shop" className="active">Shop</a>
            <a href="#categories">Collections</a>
            <a href="#custom">Custom Orders</a>
            <a href="#story">About</a>
            <a href="#footer">Contact</a>
          </nav>

          <div className="header-actions">
            <a className="iconbtn" href={CONFIG.instagramUrl} target="_blank" rel="noopener" aria-label="Instagram">
              <Icon name="spark" size={18} />
            </a>
            <a className="iconbtn" href={`https://wa.me/${CONFIG.whatsappNumber}`} target="_blank" rel="noopener" aria-label="Message on WhatsApp">
              <Icon name="globe" size={18} />
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
      <MobileNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

Object.assign(window, { AnnouncementBar, Header, MobileNavDrawer });
