// tokens-sheet.jsx — Design system reference (palette, type, motion, components).

function TokenSheet() {
  const palette = [
    ["Brand · Tangerine", [
      ["--joy-50",  "oklch(.987 .020 60)"],
      ["--joy-100", "oklch(.960 .045 58)"],
      ["--joy-200", "oklch(.920 .090 58)"],
      ["--joy-300", "oklch(.870 .130 56)"],
      ["--joy-400", "oklch(.830 .160 56)"],
      ["--joy-500", "oklch(.780 .190 55)"],
      ["--joy-600", "oklch(.680 .170 50)"],
      ["--joy-700", "oklch(.580 .160 45)"],
      ["--joy-800", "oklch(.460 .140 42)"],
      ["--joy-900", "oklch(.340 .100 40)"],
      ["--joy-950", "oklch(.200 .050 40)"],
    ]],
    ["Accents", [
      ["--rose-300", "oklch(.840 .110 8)"],
      ["--rose-500", "oklch(.660 .190 6)"],
      ["--rose-700", "oklch(.500 .165 4)"],
      ["--iris-300", "oklch(.780 .110 285)"],
      ["--iris-500", "oklch(.580 .175 285)"],
      ["--iris-700", "oklch(.420 .150 285)"],
      ["--sun-300",  "oklch(.940 .130 92)"],
      ["--sun-500",  "oklch(.880 .180 92)"],
      ["--sun-700",  "oklch(.700 .160 88)"],
    ]],
    ["Neutrals", [
      ["--paper",     "oklch(.987 .008 70)"],
      ["--paper-2",   "oklch(.968 .010 70)"],
      ["--paper-3",   "oklch(.940 .012 70)"],
      ["--line",      "oklch(.905 .014 60)"],
      ["--line-2",    "oklch(.820 .020 55)"],
      ["--ink-faint", "oklch(.720 .014 50)"],
      ["--ink-muted", "oklch(.510 .020 50)"],
      ["--ink-soft",  "oklch(.310 .024 50)"],
      ["--ink",       "oklch(.180 .022 50)"],
    ]],
  ];

  const typeSpecs = [
    { name: "Hero",      family: "Bricolage Grotesque", size: "clamp(72, 12vw, 184)px", weight: 500, tracking: "-0.045em", sample: "Crochet made by hand." },
    { name: "Section H2", family: "Bricolage Grotesque", size: "clamp(36, 5vw, 64)px",  weight: 500, tracking: "-0.03em",  sample: "Fresh off the hook." },
    { name: "Display accent", family: "Bricolage Grotesque", size: "44px", weight: 500, tracking: "-0.02em", sample: "made for you." },
    { name: "Body L",    family: "Geist",                size: "20px", weight: 400, tracking: "0",       sample: "Soft amigurumi, flower clips, charms and keychains." },
    { name: "Body",      family: "Geist",                size: "15px", weight: 400, tracking: "0",       sample: "Lav Crochets is a little handmade crochet studio." },
    { name: "UI label",  family: "Geist",                size: "13px", weight: 500, tracking: "0",       sample: "Add to cart" },
    { name: "Mono eyebrow", family: "Geist Mono",        size: "11px", weight: 500, tracking: "0.12em",  sample: "COLLECTIONS · 6 ITEMS" },
  ];

  const easings = [
    ["--ease-out-soft",    "cubic-bezier(.22, 1, .36, 1)",     "Default UI"],
    ["--ease-out-spring",  "cubic-bezier(.34, 1.56, .64, 1)",  "Badge pop, heart"],
    ["--ease-in-soft",     "cubic-bezier(.4, 0, 1, 1)",        "Exits, dismisses"],
    ["--ease-in-out-soft", "cubic-bezier(.65, 0, .35, 1)",     "Layout, drawer"],
  ];
  const durations = [
    ["--dur-fast", "120ms", "Hover, tap"],
    ["--dur-base", "220ms", "Default transition"],
    ["--dur-med",  "380ms", "Header shrink, modal"],
    ["--dur-slow", "640ms", "Drawer slide, layout"],
  ];

  return (
    <section className="tokens" id="tokens">
      <div className="wrap">
        <Reveal>
          <div className="eyebrow" style={{ marginBottom: 18 }}>
            <span className="eyebrow-dot" />Design system reference
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px, 5vw, 72px)", letterSpacing: "-0.035em", fontWeight: 500, margin: 0, lineHeight: 0.95 }}>
            The whole system, <span className="font-italic" style={{ color: "var(--joy-700)" }}>on one shelf.</span>
          </h2>
          <p style={{ color: "var(--fg-soft)", maxWidth: "60ch", marginTop: 18, fontSize: 17 }}>
            Tokens compile to a Tailwind v4 <code className="font-mono" style={{ background: "var(--bg-subtle)", padding: "2px 6px", borderRadius: 4 }}>@theme</code> block.
            All colors in oklch for perceptual evenness. All motion through four named curves and four duration steps.
          </p>
        </Reveal>

        <div className="spacer-lg" />

        {/* Palette */}
        {palette.map(([groupName, swatches], gi) => (
          <Reveal key={groupName} delay={gi * 80}>
            <div style={{ marginBottom: 36 }}>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-muted)", margin: "0 0 14px" }}>{groupName}</h3>
              <div className="grid-tokens">
                {swatches.map(([k, v]) => (
                  <div key={k} className="tok-swatch" style={{ gridColumn: "span 1" }}>
                    <div className="chip-color" style={{ background: `var(${k})` }} />
                    <div className="lbl">{k}</div>
                    <div className="val">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}

        <div className="spacer-lg" />

        {/* Type */}
        <Reveal>
          <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-muted)", margin: "0 0 14px" }}>Type pairing</h3>
          <div className="grid-2" style={{ gap: 48, marginBottom: 36 }}>
            <div>
              <div className="font-display" style={{ fontSize: 96, fontWeight: 500, lineHeight: 0.9, letterSpacing: "-0.04em" }}>Aa</div>
              <div className="eyebrow" style={{ marginTop: 8 }}><span className="eyebrow-dot" />Display · Bricolage Grotesque (variable, opsz)</div>
              <p className="soft" style={{ marginTop: 8, maxWidth: "40ch" }}>Real character at large sizes, calm at small sizes thanks to the optical-size axis. Italic substitution via Instrument Serif for moments of emphasis.</p>
            </div>
            <div>
              <div className="font-body" style={{ fontSize: 96, fontWeight: 500, lineHeight: 0.9 }}>Bb</div>
              <div className="eyebrow" style={{ marginTop: 8 }}><span className="eyebrow-dot" />Body · Geist (Vercel) + Geist Mono</div>
              <p className="soft" style={{ marginTop: 8, maxWidth: "40ch" }}>Modern grotesque with mechanical numerals. Mono cousin for eyebrows, meta lines, and SKU-style stamps.</p>
            </div>
          </div>

          {typeSpecs.map((t) => (
            <div className="type-spec" key={t.name}>
              <div className="meta">{t.name} · {t.family} · {t.size} · {t.weight} · {t.tracking}</div>
              <div className="sample" style={{
                fontFamily: t.family === "Geist Mono" ? "var(--font-mono)" :
                            t.family === "Geist" ? "var(--font-body)" : "var(--font-display)",
                color: t.name === "Display accent" ? "var(--joy-700)" : "var(--fg)",
                fontSize: t.size.includes("clamp") ? "clamp(28px, 4vw, 56px)" : t.size,
                fontWeight: t.weight,
                letterSpacing: t.tracking,
                lineHeight: 1.1,
              }}>
                {t.sample}
              </div>
            </div>
          ))}
        </Reveal>

        <div className="spacer-lg" />

        {/* Motion */}
        <Reveal>
          <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-muted)", margin: "0 0 14px" }}>Motion</h3>
          <div className="grid-2" style={{ gap: 48, marginBottom: 24 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}><span className="eyebrow-dot" />Easings</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {easings.map(([n, v, use]) => (
                  <li key={n} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1.2fr", gap: 16, alignItems: "center", padding: "10px 0", borderTop: "1px dashed var(--line)" }}>
                    <span className="font-mono" style={{ fontSize: 12 }}>{n}</span>
                    <span className="font-mono" style={{ fontSize: 11, color: "var(--fg-muted)" }}>{v}</span>
                    <span className="font-mono" style={{ fontSize: 11, color: "var(--fg-soft)" }}>{use}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}><span className="eyebrow-dot" />Durations</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {durations.map(([n, v, use]) => (
                  <li key={n} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 16, alignItems: "center", padding: "10px 0", borderTop: "1px dashed var(--line)" }}>
                    <span className="font-mono" style={{ fontSize: 12 }}>{n}</span>
                    <span className="font-mono" style={{ fontSize: 11, color: "var(--fg-muted)" }}>{v}</span>
                    <span className="font-mono" style={{ fontSize: 11, color: "var(--fg-soft)" }}>{use}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Named transitions */}
          <div className="eyebrow" style={{ marginBottom: 10 }}><span className="eyebrow-dot" />Named transitions (Framer Motion variants)</div>
          <div className="grid-3" style={{ gap: 16 }}>
            {[
              ["page-enter",    "opacity 0 → 1, y 16 → 0", "med · ease-out-soft"],
              ["page-exit",     "opacity 1 → 0, y 0 → -8", "fast · ease-in-soft"],
              ["hover-lift",    "y 0 → -2, shadow 1 → 3",  "fast · ease-out-soft"],
              ["tap",           "scale 1 → .98",            "fast · ease-out-soft"],
              ["layout-shift",  "auto-layout",              "med · ease-in-out-soft"],
              ["drawer-open",   "x 100% → 0",               "slow · ease-in-out-soft"],
              ["modal-open",    "opacity 0 → 1, scale .96 → 1", "base · ease-out-soft"],
              ["list-stagger",  "child delay 60ms",         "base · ease-out-soft"],
              ["badge-pop",     "scale .85 → 1.18 → 1",     "base · ease-out-spring"],
            ].map(([n, w, t]) => (
              <div key={n} style={{ padding: 14, border: "1px solid var(--line)", borderRadius: 12, background: "var(--bg)" }}>
                <div className="font-mono" style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{n}</div>
                <div className="font-mono" style={{ fontSize: 11, color: "var(--fg-soft)" }}>{w}</div>
                <div className="font-mono" style={{ fontSize: 10, color: "var(--fg-muted)", marginTop: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>{t}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="spacer-lg" />

        {/* Components */}
        <Reveal>
          <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-muted)", margin: "0 0 14px" }}>Buttons</h3>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginBottom: 36 }}>
            <button className="btn">Primary</button>
            <button className="btn ink">Ink</button>
            <button className="btn ghost">Ghost</button>
            <button className="btn outline">Outline</button>
            <button className="btn lg">Large</button>
            <button className="btn xl">Extra large</button>
            <button className="btn icon" aria-label="cart"><Icon name="cart" size={18}/></button>
          </div>

          <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-muted)", margin: "0 0 14px" }}>Chips, badges, status</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            <span className="chip">Default</span>
            <span className="chip free">FREE</span>
            <span className="chip new">NEW</span>
            <span className="chip pick">EDITOR'S PICK</span>
            <span className="chip sale">SALE 35%</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 36 }}>
            <span className="statusbadge paid">paid</span>
            <span className="statusbadge pending">pending</span>
            <span className="statusbadge refunded">refunded</span>
            <span className="statusbadge partial">partially refunded</span>
            <span className="statusbadge failed">failed</span>
          </div>

          <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-muted)", margin: "0 0 14px" }}>Radius and shadow</h3>
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            {[["--r-1","4"],["--r-2","8"],["--r-3","12"],["--r-4","18"],["--r-5","26"],["--r-pill","∞"]].map(([k,v])=>(
              <div key={k} style={{ width: 90, height: 90, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: `var(${k})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)" }}>{v}px</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[["--shadow-1","1"],["--shadow-2","2"],["--shadow-3","3"],["--shadow-4","4"]].map(([k,v])=>(
              <div key={k} style={{ width: 100, height: 80, background: "var(--bg)", borderRadius: 12, boxShadow: `var(${k})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)" }}>shadow {v}</div>
            ))}
            <div style={{ width: 100, height: 80, background: "var(--joy-500)", borderRadius: 12, boxShadow: "var(--shadow-brand)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--joy-950)" }}>brand</div>
          </div>
        </Reveal>

        <div className="spacer-lg" />

        {/* Do-not-do sidebar */}
        <Reveal>
          <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-muted)", margin: "0 0 14px" }}>Do not do</h3>
          <div className="panel" style={{ background: "var(--ink)", color: "var(--paper)", padding: 36 }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: "-0.02em", margin: 0, lineHeight: 1.2 }}>
              The founder rejected these. Surface them here so the direction holds.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "28px 0 0", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, fontSize: 14, lineHeight: 1.5 }}>
              {[
                "Muted cream-and-saffron palette.",
                "Fraunces serif as display.",
                "Single-headline italic-with-scribble hero.",
                "Atlas hard-offset shadow CTA.",
                "Three-card-cluster hero with product rotations.",
                "Trust strip with three truthful facts.",
                "Editorial bookshop copy voice.",
                "Em dashes anywhere.",
                "Comic-sans, primary-color stickers, infantilizing copy.",
                "Drop shadows the size of a roof.",
                "Generic Chart.js admin charts.",
                "Auto-rotating hero carousels.",
              ].map(s => (
                <li key={s} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ flex: "0 0 18px", display: "inline-flex", justifyContent: "center", alignItems: "center", height: 18, color: "var(--rose-500)" }}>
                    <Icon name="x" size={14} stroke={2} />
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

Object.assign(window, { TokenSheet });
