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
function ProductCard({ p, onAdd }) {
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

      {/* Tight content cluster: title / price / meta / add */}
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
        {onAdd && (
          <button className="pcard-add" onClick={() => onAdd(p)}>
            Add to cart <Icon name="arrow" size={14} />
          </button>
        )}
      </div>
    </article>
  );
}

// ── Featured row ──────────────────────────────────────────────────────
function FeaturedRow({ products, onAdd }) {
  return (
    <section className="section" id="shop">
      <div className="wrap">
        <SectionHead
          eyebrow="Fresh off the hook"
          title={<>Handmade pieces,<br/><em>ready to love.</em></>}
          action={<a className="btn ghost" href="shop.html">Shop all <Icon name="arrow" size={14} /></a>}
        />
        <div className="pgrid">
          {products.slice(0, 4).map(p => (
            <ProductCard key={p.id} p={p} onAdd={onAdd} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Ready-to-ship row ─────────────────────────────────────────────────
function FreeRow({ products, onAdd }) {
  const ready = products.filter(p => p.stockStatus === "ready");
  return (
    <section className="section tight" id="free" style={{ background: "var(--bg-elev)" }}>
      <div className="wrap">
        <SectionHead
          eyebrow="In stock"
          title={<>Ready now. <em>Delivered in 4 to 5 days.</em></>}
          action={<a className="btn ghost" href="shop.html">See the shop <Icon name="arrow" size={14} /></a>}
        />
        <div className="pgrid">
          {ready.map(p => (
            <ProductCard key={p.id} p={p} onAdd={onAdd} />
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
              <Reveal key={c.id} delay={i * 60} className="cat-tile" as="a" href={`shop.html?cat=${c.id}`} style={{ background: s.bg, color: s.fg }}>
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
            <a href="custom.html" className="btn xl ink" style={{ width: "100%", justifyContent: "center" }}>
              Start a custom order <Icon name="arrow" size={16} />
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

// ── How-ordering-works steps (scroll-lit timeline) ────────────────────
const ORDER_STEPS = [
  "Browse and pick your pieces.",
  "Send your order on WhatsApp.",
  "We confirm stock, total and shipping.",
  "Pay securely by UPI.",
  "We hook it by hand and ship.",
];

// Scroll-driven ordered list. As the section scrolls past an activation line,
// each numbered point lights up in turn (1 -> 5) and stays lit; the current
// point gets a filled "active" dot. On mobile each step is a card that reveals
// as it scrolls in. `seen` is monotonic (points stay lit / cards stay shown);
// `active` tracks the current point both ways.
function OrderSteps() {
  const olRef = React.useRef(null);
  const [seen, setSeen] = React.useState(0);
  const [active, setActive] = React.useState(-1);

  React.useEffect(() => {
    const ol = olRef.current;
    if (!ol) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const line = window.innerHeight * 0.62;   // activation line
      const items = ol.children;
      let count = 0;
      for (let i = 0; i < items.length; i++) {
        // light a point once its badge centre rises above the line (badge ~34px)
        if (items[i].getBoundingClientRect().top + 17 <= line) count = i + 1;
      }
      setSeen((prev) => (count > prev ? count : prev));        // never un-light
      setActive((prev) => (prev === count - 1 ? prev : count - 1));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute); };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <ol className="order-steps" ref={olRef}>
      {ORDER_STEPS.map((t, i) => (
        <li key={i} className={`order-step${i < seen ? " is-lit" : ""}${i === active ? " is-active" : ""}`}>
          <span className="order-step-num" aria-hidden="true">{i + 1}</span>
          <span className="order-step-text">{t}</span>
        </li>
      ))}
    </ol>
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
            <div className="panel brand order-card" style={{ aspectRatio: "1.05 / 1", display: "flex", flexDirection: "column" }}>
              <div className="eyebrow" style={{ color: "color-mix(in oklch, var(--joy-950) 60%, transparent)" }}>
                <span className="eyebrow-dot" style={{ background: "var(--joy-950)" }} />How ordering works
              </div>
              <OrderSteps />
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
            <a href={CONFIG.instagramUrl} target="_blank" rel="noopener" className="btn xl btn-flash" style={{ width: "100%", justifyContent: "center", height: 52 }}>
              Follow on Instagram <Icon name="arrow-up-right" size={16} />
            </a>
            <a href={waHref} target="_blank" rel="noopener" className="btn xl outline btn-flash" style={{ width: "100%", justifyContent: "center", height: 52, color: "var(--paper)", borderColor: "color-mix(in oklch, var(--paper) 30%, transparent)" }}>
              Message on WhatsApp
            </a>
            {CONFIG.whatsappCatalogueUrl && (
              <a href={CONFIG.whatsappCatalogueUrl} target="_blank" rel="noopener" className="btn xl outline btn-flash" style={{ width: "100%", justifyContent: "center", height: 52, color: "var(--paper)", borderColor: "color-mix(in oklch, var(--paper) 30%, transparent)" }}>
                Browse the WhatsApp catalogue
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FAQ (shared: home + about) ────────────────────────────────────────
// Single-open accordion. Answers stay short and answer the questions people
// actually ask before a first order. Grid-rows 0fr/1fr drives the open anim.
const FAQ_ITEMS = [
  {
    q: "How do I place an order?",
    a: "Browse the shop and send your picks on WhatsApp, or tap Add to cart and message the order through. I confirm stock, the total and shipping, then share UPI details so you can pay.",
  },
  {
    q: "How long until it arrives?",
    a: "Ready-to-ship pieces are usually delivered in 4 to 5 days, anywhere in India. For custom and made-to-order pieces I confirm the making time with you over chat first. Share your pincode on WhatsApp and I will confirm shipping for your area.",
  },
  {
    q: "Do you take custom orders?",
    a: "Always, they are my favourite. Tell me what you have in mind, a plushie of your pet, a charm of a favourite character, a bouquet that never wilts, and we plan the design, colours, timing and price together.",
  },
  {
    q: "How do I pay?",
    a: "By UPI. Once we have confirmed your order on WhatsApp, I send a UPI ID or QR so you can pay securely from any app.",
  },
  {
    q: "Can I choose my own colours and sizes?",
    a: "Yes. Most pieces can be made in the colours you like, and many in different sizes too. Just mention it when you message and I will let you know what is possible.",
  },
  {
    q: "How do I care for a crochet piece?",
    a: "Spot clean when you can, or hand wash gently in cold water and reshape while damp. Keep it away from rough surfaces and damp, and it will last for years.",
  },
];

function FAQ({ eyebrow = "Good to know", title, items = FAQ_ITEMS, id = "faq" }) {
  const [open, setOpen] = React.useState(0);
  return (
    <section className="section tight" id={id}>
      <div className="wrap faq-wrap">
        <SectionHead
          eyebrow={eyebrow}
          title={title || <>Questions, <em>answered.</em></>}
        />
        <div className="faq-list">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} delay={i * 40} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button
                  className="faq-q focus-ring"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span>{it.q}</span>
                  <span className="faq-icon" aria-hidden="true"><Icon name="chev-right" size={18} /></span>
                </button>
                <div className="faq-a">
                  <div><p>{it.a}</p></div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── About page (about.html) ───────────────────────────────────────────
function AboutPage() {
  const promises = [
    "Every piece is hooked by hand, one at a time.",
    "Your colours and sizes are always welcome.",
    "Made in small batches, so no two are identical.",
    "Order on WhatsApp, pay by UPI, delivered in 4 to 5 days.",
  ];
  return (
    <>
      <section className="section page-top" id="about">
        <div className="wrap">
          <SectionHead
            eyebrow="The maker"
            title={<>Hi, I'm Janhavi.<br/><em>Most people call me Lav.</em></>}
          />
          <div className="grid-2 about-grid" style={{ alignItems: "start", gap: 64 }}>
            <Reveal>
              <div className="about-story">
                <p className="about-lead">
                  {CONFIG.brandName} started with one ball of cotton yarn, a borrowed hook, and a
                  YouTube video I kept pausing and rewinding until my fingers finally caught on.
                </p>
                <p>
                  I was after something to do with my hands, something slow in a world that moves a
                  little too fast. The first thing I ever finished was a lopsided little flower. It
                  was far from perfect, but I had made it from a single thread, and I was hooked, in
                  every sense.
                </p>
                <p>
                  "Lav" is the name my closest people call me. It is also the word stitched into
                  everything I make. Every charm, clip and keychain leaves my hands made with love,
                  never rushed and never mass-produced, so no two are ever exactly alike. I think
                  that is the best part.
                </p>
                <p>
                  Today, from my little studio in {CONFIG.city}, I crochet bag charms, hair
                  accessories and keychains, plus all the custom pieces people dream up. You bring
                  the colours and the idea; I hook it, one stitch at a time.
                </p>
                <p className="about-sign">Thank you for letting a small handmade thing into your day.</p>
                <p className="about-sign-name">love, Lav</p>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="panel brand about-promise">
                <div className="eyebrow" style={{ color: "color-mix(in oklch, var(--joy-950) 60%, transparent)", marginBottom: 18 }}>
                  <span className="eyebrow-dot" style={{ background: "var(--joy-950)" }} />What I promise
                </div>
                <ul className="promise-list">
                  {promises.map((t, i) => (
                    <li key={i}>
                      <span className="promise-check" aria-hidden="true"><Icon name="check" size={14} stroke={2.4} /></span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <a href="custom.html" className="btn ink btn-flash" style={{ marginTop: 28, width: "100%", justifyContent: "center" }}>
                  Start a custom order <Icon name="arrow" size={16} />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <FAQ />

      <section className="section tight">
        <div className="wrap">
          <div className="panel ink about-cta">
            <div className="eyebrow" style={{ color: "color-mix(in oklch, var(--paper) 60%, transparent)", marginBottom: 16, justifyContent: "center" }}>
              <span className="eyebrow-dot" style={{ background: "var(--joy-500)" }} />Come say hi
            </div>
            <h2>Ready to find your <span className="about-cta-em">new favourite thing?</span></h2>
            <div className="about-cta-actions">
              <a className="btn xl btn-flash" href="shop.html">Shop the studio <Icon name="arrow" size={16} /></a>
              <a className="btn xl outline btn-flash" href="contact.html" style={{ color: "var(--paper)", borderColor: "color-mix(in oklch, var(--paper) 30%, transparent)" }}>
                Get in touch
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── Contact page (contact.html) ───────────────────────────────────────
function ContactPage() {
  const wa = `https://wa.me/${CONFIG.whatsappNumber}`;
  const methods = [
    {
      brand: true, icon: "whatsapp", label: "WhatsApp",
      value: CONFIG.whatsappDisplay, sub: "Orders, custom briefs and quick questions.",
      href: wa, ext: true, cta: "Message on WhatsApp",
    },
    {
      icon: "instagram", label: "Instagram",
      value: CONFIG.instagramHandle, sub: "New drops, restocks and behind-the-scenes.",
      href: CONFIG.instagramUrl, ext: true, cta: "Follow along",
    },
    {
      icon: "mail", label: "Email",
      value: CONFIG.supportEmail, sub: "For anything that needs a longer note.",
      href: `mailto:${CONFIG.supportEmail}`, cta: "Send an email",
    },
  ];
  return (
    <section className="section page-top" id="contact">
      <div className="wrap">
        <SectionHead
          eyebrow="Say hello"
          title={<>Let's make something,<br/><em>or just say hi.</em></>}
        />
        <p className="custom-lead">
          The quickest way to reach me is WhatsApp, that is where orders, custom briefs and questions
          all happen. You will also find me on Instagram, or you can drop an email.
        </p>

        <div className="contact-grid">
          {methods.map((m, i) => (
            <Reveal key={m.label} delay={i * 80}
              as="a" href={m.href}
              {...(m.ext ? { target: "_blank", rel: "noopener" } : {})}
              className={`contact-card ${m.brand ? "brand" : ""}`}
            >
              <span className="contact-ico" aria-hidden="true"><Icon name={m.icon} size={22} /></span>
              <span className="contact-label">{m.label}</span>
              <span className="contact-value">{m.value}</span>
              <span className="contact-sub">{m.sub}</span>
              <span className="contact-go">{m.cta} <Icon name="arrow" size={15} /></span>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="contact-meta">
            <span><Icon name="globe" size={14} stroke={1.6} /> {CONFIG.city}</span>
            <span className="contact-dot" aria-hidden="true" />
            <span>I usually reply within a day</span>
            <span className="contact-dot" aria-hidden="true" />
            <span>Order on WhatsApp, pay by UPI</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ── Shop page (shop.html) ─────────────────────────────────────────────
function ShopPage({ products, onAdd }) {
  const initial = (() => {
    try { return new URLSearchParams(window.location.search).get("cat") || "all"; }
    catch (e) { return "all"; }
  })();
  const [cat, setCat] = React.useState(initial);
  const filtered = cat === "all" ? products : products.filter(p => p.category === cat);
  return (
    <section className="section page-top" id="shop">
      <div className="wrap">
        <SectionHead
          eyebrow="Shop"
          title={<>Every piece, <em>hooked by hand.</em></>}
        />
        <div className="shop-filters" role="tablist" aria-label="Filter by collection">
          <button className={`shop-filter ${cat === "all" ? "active" : ""}`} onClick={() => setCat("all")}>All</button>
          {CATEGORIES.map(c => (
            <button key={c.id} className={`shop-filter ${cat === c.id ? "active" : ""}`} onClick={() => setCat(c.id)}>{c.title}</button>
          ))}
        </div>
        <div className="pgrid">
          {filtered.map(p => <ProductCard key={p.id} p={p} onAdd={onAdd} />)}
        </div>
        {filtered.length === 0 && (
          <p style={{ color: "var(--fg-muted)", marginTop: 24 }}>Nothing here yet, check another collection.</p>
        )}
      </div>
    </section>
  );
}

// ── Custom order page (custom.html) ───────────────────────────────────
// A form that composes a WhatsApp message from the fields. No backend.
function CustomPage() {
  const [f, setF] = React.useState({ name: "", piece: "", colours: "", size: "", deadline: "", notes: "" });
  const set = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    // WhatsApp markdown: *bold* labels, \n line breaks (render on mobile +
    // WhatsApp Web; the desktop app may flatten the newlines).
    const body = [
      `*Name:* ${f.name || "-"}`,
      `*What I'd like:* ${f.piece || "-"}`,
      `*Colours:* ${f.colours || "-"}`,
      `*Size / quantity:* ${f.size || "-"}`,
      `*Need by:* ${f.deadline || "-"}`,
      f.notes ? `*Notes:* ${f.notes}` : null,
    ].filter(Boolean).join("\n");
    const msg = `Hi ${CONFIG.brandName}! I'd like a *custom crochet piece*.\n\n${body}`;
    window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  };
  return (
    <section className="section page-top" id="custom">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <SectionHead
          eyebrow="Custom orders"
          title={<>Let's make <em>something yours.</em></>}
        />
        <p className="custom-lead">
          Tell me what you have in mind, a plushie of your pet, a charm of your favourite character,
          a bouquet for a gift. Hit send and it opens WhatsApp with your brief, where we'll confirm
          the design, timing and price together.
        </p>
        <form className="cform" onSubmit={submit}>
          <label className="cfield">
            <span>Your name</span>
            <input value={f.name} onChange={set("name")} placeholder="Your name" />
          </label>
          <label className="cfield">
            <span>What would you like? *</span>
            <textarea rows={3} required value={f.piece} onChange={set("piece")} placeholder="e.g. a plushie of my cat, a Spider-Man charm, a tulip bouquet..." />
          </label>
          <div className="cgrid">
            <label className="cfield">
              <span>Colours</span>
              <input value={f.colours} onChange={set("colours")} placeholder="e.g. pastel pinks" />
            </label>
            <label className="cfield">
              <span>Size / quantity</span>
              <input value={f.size} onChange={set("size")} placeholder="e.g. 2 pieces, palm-size" />
            </label>
          </div>
          <label className="cfield">
            <span>Need it by? (optional)</span>
            <input value={f.deadline} onChange={set("deadline")} placeholder="e.g. before 20 July" />
          </label>
          <label className="cfield">
            <span>Anything else? (optional)</span>
            <textarea rows={2} value={f.notes} onChange={set("notes")} placeholder="Links, references, a story..." />
          </label>
          <button type="submit" className="btn btn-flash" style={{ alignSelf: "center", marginTop: 4 }}>
            Send on WhatsApp <WaIcon size={16} />
          </button>
          <p className="custom-note">
            Pay by UPI · Making time and final price are confirmed over chat · Delivered in 4 to 5 days once it's ready.
          </p>
        </form>
      </div>
    </section>
  );
}

Object.assign(window, {
  CategoryMarquee, SectionHead, ProductCard, FeaturedRow, FreeRow, CategoryGrid,
  CustomOrders, QuoteBlock, InstagramRow, Newsletter, ShopPage, CustomPage,
  FAQ, AboutPage, ContactPage,
});
