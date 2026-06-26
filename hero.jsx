// hero.jsx — type-driven, motion-rich hero (pre-content-adapter version).
// Single column. Headline carries the brand. Decorative wave orb top-right.

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <Reveal delay={0}>
          <div className="hero-eyebrow" style={{ marginBottom: 28 }}>
            <span className="pulse" aria-hidden="true" />
            <span>New this week.</span>
            <span style={{ color: "var(--fg-faint)" }}>·</span>
            <span>Tulip bouquets, made to order.</span>
            <a href="#shop" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--fg)", fontWeight: 500 }}>
              See it <Icon name="arrow" size={14} />
            </a>
          </div>
        </Reveal>

        <h1 className="hero-headline">
          <Reveal as="span" style={{ display: "block" }} delay={100}>
            Crochet that's
          </Reveal>
          <Reveal as="span" style={{ display: "block" }} delay={220}>
            <em>made</em> by hand
          </Reveal>
          <Reveal as="span" style={{ display: "block" }} delay={340}>
            and <span className="crayon">made for you.</span>
          </Reveal>
        </h1>

        <Reveal delay={500}>
          <p className="hero-sub" style={{ marginTop: 36, fontSize: "clamp(18px, 1.6vw, 22px)" }}>
            {CONFIG.brandName} is a tiny crochet studio in {CONFIG.city}. Soft amigurumi, never-wilt
            bouquets, bags and cosy wearables, each piece hooked by hand. Order on WhatsApp, pay by UPI.
          </p>
        </Reveal>

        <Reveal delay={620}>
          <div className="hero-actions" style={{ marginTop: 36 }}>
            <a className="btn xl ink" href="#free">
              Shop ready-to-ship
              <Icon name="arrow" size={16} />
            </a>
            <a className="btn xl ghost" href="#custom">
              Start a custom order
            </a>
          </div>
        </Reveal>

        <Reveal delay={760}>
          <div className="hero-meta" style={{ marginTop: 56 }}>
            <span><strong style={{ color: "var(--fg)", fontFamily: "var(--font-display)", fontSize: 18 }}>300+</strong> pieces hooked by hand</span>
            <span className="dot" aria-hidden="true" />
            <span><strong style={{ color: "var(--fg)", fontFamily: "var(--font-display)", fontSize: 18 }}>4.9</strong> from happy gifters</span>
            <span className="dot" aria-hidden="true" />
            <span>Order on WhatsApp. Pay by UPI.</span>
          </div>
        </Reveal>
      </div>

      {/* Decorative tangerine wave glyph in the upper right corner. */}
      <div className="hero-orb" aria-hidden="true">
        <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }}>
          <defs>
            <linearGradient id="joygrad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--joy-500)"/>
              <stop offset="100%" stopColor="var(--joy-700)"/>
            </linearGradient>
          </defs>
          <g style={{ transformOrigin: "300px 300px", animation: "spin 60s linear infinite" }}>
            <circle cx="300" cy="300" r="240" fill="none" stroke="var(--joy-300)" strokeWidth="1" strokeDasharray="2 6"/>
          </g>
          <path d="M 120 320 Q 240 200, 360 320 T 540 320" stroke="url(#joygrad)" strokeWidth="36" fill="none" strokeLinecap="round" opacity="0.85"/>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </svg>
      </div>
    </section>
  );
}

Object.assign(window, { Hero });
