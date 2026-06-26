// app.jsx — Root composition + Tweaks panel.

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

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [cart, setCart] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("lav.cart") || "[]"); } catch (e) { return []; }
  });
  const [cartOpen, setCartOpen] = React.useState(false);
  const [bump, setBump] = React.useState(false);
  // Theme: persisted, defaults to the OS preference on first visit.
  const [dark, setDark] = React.useState(() => {
    try {
      const saved = localStorage.getItem("lav.theme");
      if (saved === "dark" || saved === "light") return saved === "dark";
      return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    } catch (e) { return false; }
  });
  const toggleTheme = () => setDark(d => !d);
  const progress = useScrollProgress();
  // Which page is this? Each HTML sets <body data-page="home|shop|custom">.
  const page = (typeof document !== "undefined" && document.body.dataset.page) || "home";

  // Persist the cart across pages + reloads.
  React.useEffect(() => {
    try { localStorage.setItem("lav.cart", JSON.stringify(cart)); } catch (e) { /* no-op */ }
  }, [cart]);

  // Apply tweaks live
  React.useEffect(() => { applyPalette(t.palette); }, [t.palette]);
  React.useEffect(() => { applyFontPair(t.fontPair); }, [t.fontPair]);
  React.useEffect(() => { applyDensity(t.density); }, [t.density]);
  React.useEffect(() => { applyRadius(t.radius); }, [t.radius]);
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try { localStorage.setItem("lav.theme", dark ? "dark" : "light"); } catch (e) { /* no-op */ }
  }, [dark]);

  // Owner-only: open the Tweaks panel locally with ?tweaks=1 in the URL.
  // Normal visitors never see it (it stays hidden unless edit mode is activated).
  React.useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).has("tweaks")) {
        window.postMessage({ type: "__activate_edit_mode" }, "*");
      }
    } catch (e) { /* no-op */ }
  }, []);

  const handleAdd = (p) => {
    setCart(prev => {
      const existing = prev.find(l => l.id === p.id);
      if (existing) return prev.map(l => l.id === p.id ? { ...l, qty: l.qty + 1 } : l);
      return [...prev, { ...p, qty: 1 }];
    });
    setBump(true);
    setTimeout(() => setBump(false), 600);
  };
  const handleRemove = (id) => setCart(prev => prev.filter(l => l.id !== id));

  const cartCount = cart.reduce((s, l) => s + l.qty, 0);

  return (
    <div className="app">
      <div className="progress-bar" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />

      <Header cartCount={cartCount} onOpenCart={() => setCartOpen(true)} bump={bump} dark={dark} onToggleTheme={toggleTheme} />

      {page === "home" && (
        <>
          <Hero />
          <FeaturedRow products={PRODUCTS} onAdd={handleAdd} />
          <CategoryGrid />
          <FreeRow products={PRODUCTS} onAdd={handleAdd} />
          <CustomOrders />
          <QuoteBlock />
          <InstagramRow />
          <Newsletter />
          <TokenSheet />
        </>
      )}

      {page === "shop" && <ShopPage products={PRODUCTS} onAdd={handleAdd} />}

      {page === "custom" && <CustomPage />}

      <Footer dark={dark} onToggleTheme={toggleTheme} />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        lines={cart}
        onRemove={handleRemove}
      />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand color" />
        <TweakRadio
          label="Palette"
          value={t.palette}
          options={[
            { value: "plum",     label: "plum" },
            { value: "lavender", label: "lavender" },
            { value: "blush",    label: "blush" },
            { value: "mauve",    label: "mauve" },
          ]}
          onChange={(v) => setTweak('palette', v)}
        />

        <TweakSection label="Typography" />
        <TweakRadio
          label="Type pair"
          value={t.fontPair}
          options={[
            { value: "bricolage-geist",   label: "Bricolage + Geist" },
            { value: "geist-only",        label: "Geist alone" },
          ]}
          onChange={(v) => setTweak('fontPair', v)}
        />

        <TweakSection label="Layout" />
        <TweakRadio
          label="Density"
          value={t.density}
          options={["compact", "regular", "comfy"]}
          onChange={(v) => setTweak('density', v)}
        />
        <TweakRadio
          label="Radius"
          value={t.radius}
          options={["sharp", "round", "soft"]}
          onChange={(v) => setTweak('radius', v)}
        />

        <TweakSection label="Theme" />
        <TweakToggle
          label="Dark mode"
          value={dark}
          onChange={(v) => setDark(v)}
        />

        <TweakSection label="Quick actions" />
        <TweakButton label="Open cart drawer" onClick={() => setCartOpen(true)} />
        <TweakButton label="Scroll to tokens" onClick={() => {
          const el = document.getElementById('tokens');
          if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
        }} />
        <TweakButton label="Scroll to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
