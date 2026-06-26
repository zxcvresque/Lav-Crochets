// sections.jsx — Marquee, featured row, category grid, custom orders,
// quote / how-it-works, Instagram, social signup.

// ── Category marquee ───────────────────────────────────────────────────
function CategoryMarquee() {
  const items = [
    "amigurumi", "bouquets", "tote bags", "beanies",
    "keychains", "baby booties", "granny squares", "plushies",
    "coasters", "cardigans", "custom orders"
  ];
  const seq = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {seq.map((t, i) => (
          <span key={i} className="item" style={{ display: "inline-flex", alignItems: "center", gap: 30 }}>
            <Icon name="star" size={28} stroke={0} />
            <span>{i % 3 === 1 ? <em>{t}</em> : t}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Section head ───────────────────────────────────────────────────────
function SectionHead({ eyebrow, title, action }) {
  return (
    <Reveal>
      <div className="section-head">
        <div>
          {eyebrow && <div className="eyebrow" style={{ marginBottom: 16 }}>
            <span className="eyebrow-dot" />{eyebrow}
          </div>}
          <h2>{title}</h2>
        </div>
        {action && <div className="right">{action}</div>}
      </div>
    </Reveal>
  );
}

// ── Product card ───────────────────────────────────────────────────────
// Structure (article > image+chip, heart sibling, stretched-link sibling,
// content) is preserved from the locked spec. Only content + tokens changed.
function ProductCard({ p }) {
  const [liked, setLiked] = React.useState(false);
  const onSale = p.wasINR && p.wasINR > p.priceINR;
  const pct = onSale ? Math.round((1 - p.priceINR / p.wasINR) * 100) : null;
  const isPick = p.chip === "pick";
  const isNew = p.chip === "new" && !isPick;
  const ready = p.stockStatus === "ready";
  const local = fmtPriceINR(p.priceINR);
  const compare = onSale ? fmtPriceINR(p.wasINR) : null;

  return (
    <article className="pcard">
      {/* Image: full-bleed, 1px border, locked aspect 1:1, no hover transform */}
      <div className="pcard-image">
        <ProductArt p={p} />
        {isPick && <span className="pcard-chip pcard-chip--pick">Bestseller</span>}
        {isNew && <span className="pcard-chip pcard-chip--free">New</span>}
      </div>

      {/* Favourite heart — session-only toggle, sibling of the stretched link */}
      <button
        className="pcard-heart focus-ring"
        data-on={liked}
        aria-pressed={liked}
        aria-label={liked ? `Remove ${p.title} from favourites` : `Save ${p.title} to favourites`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(v => !v); }}
      >
        <Icon name={liked ? "heart-fill" : "heart"} size={18} />
      </button>

      {/* Stretched-link overlay — sibling, not parent, of the heart */}
      <a className="pcard-link" href="#product" aria-label={p.title}>
        <span className="sr-only">{p.title}</span>
      </a>

      {/* Tight content cluster: title / price / meta */}
      <div className="pcard-content">
        <h3 className="pcard-title" title={p.title}>{p.title}</h3>
        <div className="pcard-price-row">
          {onSale ? (
            <>
              <span className="pcard-price pcard-price--sale">{local}</span>
              <span className="pcard-price-compare">{compare}</span>
              <span className="pcard-pct">{pct}% off</span>
            </>
          ) : (
            <span className="pcard-price">{local}</span>
          )}
        </div>
        <div className="pcard-meta">
          <Icon name={ready ? "check" : "spark"} size={12} stroke={1.8} />
          <span>{ready ? "In stock" : "Made to order"}</span>
        </div>
      </div>
    </article>
  );
}

// ── Featured row ──────────────────────────────────────────────────────
function FeaturedRow({ products }) {
  return (
    <section className="section" id="shop">
      <div className="wrap">
        <SectionHead
          eyebrow="Fresh off the hook"
          title={<>Handmade pieces,<br/><em>ready to love.</em></>}
          action={<a className="btn ghost" href="#categories">Browse all <Icon name="arrow" size={14} /></a>}
        />
        <div className="pgrid">
          {products.slice(0, 4).map(p => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Ready-to-ship row ─────────────────────────────────────────────────
function FreeRow({ products }) {
  const ready = products.filter(p => p.stockStatus === "ready");
  return (
    <section className="section tight" id="free" style={{ background: "var(--bg-elev)" }}>
      <div className="wrap">
        <SectionHead
          eyebrow="In stock"
          title={<>Ready now. <em>Delivered in 4 to 5 days.</em></>}
          action={<a className="btn ghost" href="#shop">See the shop <Icon name="arrow" size={14} /></a>}
        />
        <div className="pgrid">
          {ready.map(p => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Category grid ─────────────────────────────────────────────────────
function CategoryGrid() {
  const tileBg = (tone) => {
    switch (tone) {
      case "joy":   return { bg: "var(--joy-500)",   fg: "var(--joy-950)" };
      case "sun":   return { bg: "var(--sun-500)",   fg: "var(--joy-950)" };
      case "plum":  return { bg: "var(--iris-500)",  fg: "white" };
      case "coral": return { bg: "var(--rose-500)", fg: "white" };
      case "paper": return { bg: "var(--paper-3)",   fg: "var(--joy-950)" };
      case "ink":   return { bg: "var(--ink)",       fg: "var(--joy-500)" };
      default: return { bg: "var(--bg-elev)", fg: "var(--fg)" };
    }
  };
  const arts = {
    charms:    <g opacity=".16" fill="currentColor"><circle cx="300" cy="312" r="92"/><rect x="293" y="184" width="14" height="58" rx="7"/><circle cx="300" cy="176" r="24" fill="none" stroke="currentColor" strokeWidth="9"/></g>,
    hair:      <g opacity=".16" fill="currentColor">{[0,72,144,216,288].map(a => { const r = a*Math.PI/180; return <circle key={a} cx={300+72*Math.cos(r)} cy={300+72*Math.sin(r)} r="46"/>; })}<circle cx="300" cy="300" r="40"/></g>,
    keychains: <g opacity=".18" fill="none" stroke="currentColor" strokeWidth="8"><circle cx="300" cy="330" r="74"/><circle cx="300" cy="208" r="30"/></g>,
  };
  return (
    <section className="section" id="categories">
      <div className="wrap">
        <SectionHead
          eyebrow="Collections"
          title={<>The whole studio,<br/><em>sorted by what you love.</em></>}
        />
        <div className="grid-3" style={{ gap: 18 }}>
          {CATEGORIES.map((c, i) => {
            const s = tileBg(c.tone);
            return (
              <Reveal key={c.id} delay={i * 60} className="cat-tile" as="a" href={`#cat-${c.id}`} style={{ background: s.bg, color: s.fg }}>
                <div className="tile-bg" style={{ color: s.fg }}>
                  <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
                    {arts[c.id]}
                  </svg>
                </div>
                <div className="tile-fg">
                  <span className="count" style={{ opacity: 0.8 }}>{c.count} pieces</span>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12 }}>
                    <h3>{c.title}</h3>
                    <span aria-hidden="true" style={{ display: "inline-flex", width: 40, height: 40, borderRadius: 99, alignItems: "center", justifyContent: "center", background: "color-mix(in oklch, currentColor 14%, transparent)" }}>
                      <Icon name="arrow-up-right" size={18} />
                    </span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Custom orders ─────────────────────────────────────────────────────
function CustomOrders() {
  const waHref = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(`Hi ${CONFIG.brandName}! I would like a custom crochet piece. Here is what I have in mind:`)}`;
  return (
    <section className="section" id="custom">
      <div className="wrap">
        <div className="panel brand" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <div className="eyebrow" style={{ color: "color-mix(in oklch, var(--joy-950) 60%, transparent)", marginBottom: 16 }}>
              <span className="eyebrow-dot" style={{ background: "var(--joy-950)" }} />Custom orders
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.02, margin: 0, color: "var(--joy-950)" }}>
              Have something<br/>in mind? Let's make it.
            </h2>
            <p style={{ color: "color-mix(in oklch, var(--joy-950) 78%, transparent)", maxWidth: "46ch", marginTop: 16, fontSize: 16 }}>
              Pick your colours and the piece you dream of, a plushie of your pet, a charm of your favourite
              character, a bouquet for a gift. Send a message and we'll plan the design, timing and price together.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <a href={waHref} target="_blank" rel="noopener" className="btn xl ink" style={{ width: "100%", justifyContent: "center" }}>
              Start on WhatsApp <Icon name="arrow" size={16} />
            </a>
            <a href={CONFIG.instagramUrl} target="_blank" rel="noopener" className="btn xl outline" style={{ width: "100%", justifyContent: "center" }}>
              See custom work on Instagram
            </a>
            <p className="eyebrow" style={{ color: "color-mix(in oklch, var(--joy-950) 55%, transparent)", justifyContent: "center" }}>
              <span className="eyebrow-dot" style={{ background: "var(--joy-950)" }} />Pay by UPI · Making time confirmed over chat
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Quote / how it works ──────────────────────────────────────────────
function QuoteBlock() {
  return (
    <section className="section" id="story">
      <div className="wrap">
        <div className="grid-2" style={{ alignItems: "center", gap: 64 }}>
          <Reveal>
            <div className="eyebrow" style={{ marginBottom: 20 }}>
              <span className="eyebrow-dot" />A note from the studio
            </div>
            <p className="quote-block">
              I make pieces I would happily gift to someone I love. <em>Every stitch is by hand,</em> no two exactly alike, and your colours and sizes are always welcome.
            </p>
            <div className="quote-meta">
              <span>{CONFIG.brandName}</span>
              <span style={{ width: 4, height: 4, borderRadius: 99, background: "currentColor", opacity: 0.4 }} />
              <span>{CONFIG.city}</span>
              <span style={{ width: 4, height: 4, borderRadius: 99, background: "currentColor", opacity: 0.4 }} />
              <span>Hooked by hand</span>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="panel brand" style={{ aspectRatio: "1.05 / 1", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div className="eyebrow" style={{ color: "color-mix(in oklch, var(--joy-950) 60%, transparent)" }}>
                <span className="eyebrow-dot" style={{ background: "var(--joy-950)" }} />How ordering works
              </div>
              <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12, fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.12, counterReset: "step" }}>
                <li>1 · Browse and pick your pieces.</li>
                <li>2 · Send your order on WhatsApp.</li>
                <li>3 · We confirm stock, total and shipping.</li>
                <li>4 · Pay securely by UPI.</li>
                <li>5 · We hook it by hand and ship.</li>
              </ol>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── Instagram strip ───────────────────────────────────────────────────
function InstagramRow() {
  const fallbackArts = ["yarn", "flower", "granny", "stitch", "hearts", "stripes"];
  const posts = (CONFIG.instagramPosts && CONFIG.instagramPosts.length)
    ? CONFIG.instagramPosts.slice(0, 6)
    : fallbackArts.map((v) => ({ art: v, url: CONFIG.instagramUrl }));
  return (
    <section className="section tight" id="instagram">
      <div className="wrap">
        <SectionHead
          eyebrow="From the studio"
          title={<>Follow along on <em>{CONFIG.instagramHandle}</em></>}
          action={<a className="btn ghost" href={CONFIG.instagramUrl} target="_blank" rel="noopener">Open Instagram <Icon name="arrow-up-right" size={14} /></a>}
        />
        <div className="grid-3" style={{ gap: 14 }}>
          {posts.map((post, i) => (
            <a key={i} href={post.url || CONFIG.instagramUrl} target="_blank" rel="noopener"
               aria-label="View on Instagram"
               style={{ display: "block", aspectRatio: "1 / 1", borderRadius: "var(--r-4)", overflow: "hidden", border: "1px solid var(--line)" }}>
              {post.img
                ? <img src={post.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <PrintArt variant={post.art} />}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Social signup ─────────────────────────────────────────────────────
function Newsletter() {
  const waHref = `https://wa.me/${CONFIG.whatsappNumber}`;
  return (
    <section className="section tight" id="newsletter">
      <div className="wrap">
        <div className="panel ink" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <div className="eyebrow" style={{ color: "color-mix(in oklch, var(--paper) 60%, transparent)", marginBottom: 16 }}>
              <span className="eyebrow-dot" style={{ background: "var(--joy-500)" }} />Stay in the loop
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 4.4vw, 56px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1, margin: 0, color: "var(--paper)" }}>
              New drops and restocks,<br/>
              <span style={{ fontFamily: "var(--font-italic)", fontStyle: "italic", color: "var(--joy-300)", fontWeight: 400 }}>first on Instagram.</span>
            </h2>
            <p style={{ color: "color-mix(in oklch, var(--paper) 70%, transparent)", maxWidth: "44ch", marginTop: 16, fontSize: 16 }}>
              We post fresh pieces, behind-the-scenes, and custom work. Got a question or an order? Message us on WhatsApp anytime.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <a href={CONFIG.instagramUrl} target="_blank" rel="noopener" className="btn xl" style={{ width: "100%", justifyContent: "center", height: 52 }}>
              Follow on Instagram <Icon name="arrow-up-right" size={16} />
            </a>
            <a href={waHref} target="_blank" rel="noopener" className="btn xl outline" style={{ width: "100%", justifyContent: "center", height: 52, color: "var(--paper)", borderColor: "color-mix(in oklch, var(--paper) 30%, transparent)" }}>
              Message on WhatsApp
            </a>
            {CONFIG.whatsappCatalogueUrl && (
              <a href={CONFIG.whatsappCatalogueUrl} target="_blank" rel="noopener" className="btn xl outline" style={{ width: "100%", justifyContent: "center", height: 52, color: "var(--paper)", borderColor: "color-mix(in oklch, var(--paper) 30%, transparent)" }}>
                Browse the WhatsApp catalogue
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, {
  CategoryMarquee, SectionHead, ProductCard, FeaturedRow, FreeRow, CategoryGrid,
  CustomOrders, QuoteBlock, InstagramRow, Newsletter,
});
