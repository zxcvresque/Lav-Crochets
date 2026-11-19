"use client";
// Products, managed with the storefront's own pieces: the shop's product cards
// (so you see exactly what customers see), the cart's slide-in drawer for
// editing, and the custom-order form fields. Drag cards to set the shop order.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon, fmtPriceINR } from "@/components/site/primitives";
import { ProductArt } from "@/components/site/data";

const CATEGORIES = [
  { value: "charms", label: "Bag charms", art: "hearts" },
  { value: "hair", label: "Hair accessories", art: "flower" },
  { value: "keychains", label: "Keychains", art: "yarn" },
  { value: "cases", label: "Pouches & cases", art: "granny" },
];
const CHIPS = [
  { value: "", label: "No label" },
  { value: "new", label: "New" },
  { value: "pick", label: "Bestseller" },
  { value: "sale", label: "Sale" },
];
const FILTERS = [
  { value: "all", label: "All" },
  { value: "ready", label: "Ready to ship" },
  { value: "made-to-order", label: "Made to order" },
  { value: "draft", label: "Hidden" },
];

const list = (v) => {
  if (!v) return [];
  try { const a = JSON.parse(v); return Array.isArray(a) ? a.map(String) : []; } catch { return []; }
};
const slugify = (v) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const EMPTY = {
  title: "", slug: "", category: "charms", chip: "", stockStatus: "ready", turnaroundDays: 5,
  priceINR: "", wasINR: "", materials: "", sizes: "", colours: "", care: "", description: "",
  images: [], published: true,
};

function toForm(p) {
  return {
    title: p.title, slug: p.slug, category: p.category,
    chip: p.chip === "bestseller" ? "pick" : p.chip || "",
    stockStatus: p.stockStatus === "ready" ? "ready" : "made-to-order",
    turnaroundDays: p.turnaroundDays ?? 5,
    priceINR: String(p.priceINR ?? ""), wasINR: p.wasINR ? String(p.wasINR) : "",
    materials: p.materials || "",
    sizes: list(p.sizeOptions).join("\n"), colours: list(p.colorOptions).join("\n"),
    care: p.care || "", description: p.description || "",
    images: list(p.images), published: !!p.published,
  };
}

function cardProduct(p) {
  const art = (CATEGORIES.find((c) => c.value === p.category) || {}).art || "yarn";
  return { ...p, img: list(p.images)[0], artVariant: art };
}

export function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | product id
  const [toast, setToast] = useState(null);
  const dragId = useRef(null);

  const say = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3200); };

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const res = await fetch("/api/products?all=1", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setProducts(await res.json());
    } catch {
      setLoadError("Couldn't load products. Check your connection and refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Deep links from the overview: ?new=1 or ?edit=<id>
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("new")) setEditing("new");
    else if (q.get("edit")) setEditing(q.get("edit"));
  }, []);

  const shown = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((p) => {
      if (filter === "draft" && p.published) return false;
      if (filter === "ready" && p.stockStatus !== "ready") return false;
      if (filter === "made-to-order" && p.stockStatus === "ready") return false;
      return !term || p.title.toLowerCase().includes(term);
    });
  }, [products, filter, query]);

  const canReorder = filter === "all" && !query.trim();

  const saveOrder = async (next) => {
    setProducts(next);
    const res = await fetch("/api/products/reorder", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((p) => p.id) }),
    });
    if (res.ok) say("Shop order saved");
    else { say("Couldn't save the new order. Try again.", false); load(); }
  };

  const move = (id, delta) => {
    const i = products.findIndex((p) => p.id === id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= products.length) return;
    const next = [...products];
    [next[i], next[j]] = [next[j], next[i]];
    saveOrder(next);
  };

  const onDrop = (targetId) => {
    const from = products.findIndex((p) => p.id === dragId.current);
    const to = products.findIndex((p) => p.id === targetId);
    dragId.current = null;
    if (from < 0 || to < 0 || from === to) return;
    const next = [...products];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    saveOrder(next);
  };

  const current = editing && editing !== "new" ? products.find((p) => p.id === editing) : null;

  const closeEditor = () => {
    setEditing(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("new"); url.searchParams.delete("edit");
    window.history.replaceState(null, "", url.pathname + url.search);
  };

  return (
    <div>
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-sub">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
            {canReorder && products.length > 1 ? ". Drag cards to change the order in the shop." : "."}
          </p>
        </div>
        <button className="btn" onClick={() => setEditing("new")}>
          <Icon name="spark" size={16} /> Add a product
        </button>
      </header>

      <div className="admin-toolbar">
        <div className="shop-filters" role="tablist" aria-label="Filter products">
          {FILTERS.map((f) => (
            <button key={f.value} role="tab" aria-selected={filter === f.value}
              className={`shop-filter ${filter === f.value ? "active" : ""}`} onClick={() => setFilter(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
        <label className="admin-search">
          <Icon name="search" size={16} />
          <input type="search" placeholder="Search products" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search products" />
        </label>
      </div>

      {loading ? (
        <div className="pgrid" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="admin-skeleton-card" />)}
        </div>
      ) : loadError ? (
        <p className="admin-empty-note" role="alert">{loadError}</p>
      ) : shown.length === 0 ? (
        <div className="admin-empty-note">
          {products.length === 0
            ? <>No products yet. <button className="btn ghost" onClick={() => setEditing("new")}>Add your first piece</button></>
            : <>Nothing matches. <button className="btn ghost" onClick={() => { setFilter("all"); setQuery(""); }}>Show everything</button></>}
        </div>
      ) : (
        <div className="pgrid">
          {shown.map((p, idx) => {
            const cp = cardProduct(p);
            const ready = p.stockStatus === "ready";
            const chip = p.chip === "bestseller" ? "pick" : p.chip;
            return (
              <article
                key={p.id}
                className={`pcard admin-pcard ${p.published ? "" : "is-hidden"}`}
                draggable={canReorder}
                onDragStart={() => { dragId.current = p.id; }}
                onDragOver={(e) => { if (canReorder) e.preventDefault(); }}
                onDrop={() => onDrop(p.id)}
              >
                <button type="button" className="pcard-image admin-pcard-open" onClick={() => setEditing(p.id)} aria-label={`Edit ${p.title}`}>
                  <ProductArt p={cp} sizes="(max-width: 767px) 50vw, 25vw" />
                  {chip === "pick" && <span className="pcard-chip pcard-chip--pick">Bestseller</span>}
                  {chip === "new" && <span className="pcard-chip pcard-chip--free">New</span>}
                  {chip === "sale" && <span className="pcard-chip pcard-chip--pick">Sale</span>}
                  {!p.published && <span className="admin-hidden-tag">Hidden from shop</span>}
                  {!cp.img && <span className="admin-photo-tag">Add a photo</span>}
                </button>
                <div className="pcard-content">
                  <h3 className="pcard-title" title={p.title}>{p.title}</h3>
                  <div className="pcard-price-row">
                    <span className={`pcard-price ${p.wasINR ? "pcard-price--sale" : ""}`}>{fmtPriceINR(p.priceINR)}</span>
                    {p.wasINR ? <span className="pcard-price-compare">{fmtPriceINR(p.wasINR)}</span> : null}
                  </div>
                  <div className="pcard-meta">
                    <Icon name={ready ? "check" : "spark"} size={12} stroke={1.8} />
                    <span>{ready ? "Ready to ship" : `Made to order, ${p.turnaroundDays} days`}</span>
                  </div>
                  <div className="admin-pcard-actions">
                    <button className="pcard-add" onClick={() => setEditing(p.id)}>Edit</button>
                    {canReorder && (
                      <span className="admin-move">
                        <button className="iconbtn" onClick={() => move(p.id, -1)} disabled={idx === 0} aria-label={`Move ${p.title} earlier`}>
                          <Icon name="arrow-up" size={15} />
                        </button>
                        <button className="iconbtn" onClick={() => move(p.id, 1)} disabled={idx === shown.length - 1} aria-label={`Move ${p.title} later`}>
                          <Icon name="arrow-up" size={15} style={{ transform: "rotate(180deg)" }} />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ProductDrawer
        open={!!editing && (editing === "new" || !!current)}
        product={current}
        onClose={closeEditor}
        onSaved={(msg) => { say(msg); closeEditor(); load(); }}
        onError={(msg) => say(msg, false)}
      />

      {toast && <div className={`admin-toast ${toast.ok ? "ok" : "err"}`} role="status">{toast.msg}</div>}
    </div>
  );
}

function ProductDrawer({ open, product, onClose, onSaved, onError }) {
  const [form, setForm] = useState(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errors, setErrors] = useState({});
  const [urlDraft, setUrlDraft] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setForm(product ? toForm(product) : EMPTY);
    setSlugTouched(!!product);
    setConfirmDelete(false);
    setErrors({});
    setUrlDraft("");
  }, [open, product]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v, ...(k === "title" && !slugTouched ? { slug: slugify(v) } : {}) }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const upload = async (files) => {
    const picked = [...files].filter((f) => f.type.startsWith("image/"));
    if (!picked.length) return;
    setUploading((n) => n + picked.length);
    for (const file of picked) {
      const body = new FormData();
      body.append("file", file);
      try {
        const res = await fetch("/api/uploads", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setForm((f) => ({ ...f, images: [...f.images, data.url] }));
      } catch (e) {
        onError(e.message || `Couldn't upload ${file.name}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const moveImage = (i, delta) => setForm((f) => {
    const imgs = [...f.images]; const j = i + delta;
    if (j < 0 || j >= imgs.length) return f;
    [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    return { ...f, images: imgs };
  });

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Give the product a name";
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug)) e.slug = "Use lowercase letters, numbers and dashes";
    const price = Number(form.priceINR);
    if (!Number.isInteger(price) || price < 1) e.priceINR = "Enter a price in whole rupees";
    if (form.wasINR && (!Number.isInteger(Number(form.wasINR)) || Number(form.wasINR) <= price)) e.wasINR = "Should be higher than the price";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    // One option per line (options themselves may contain commas).
    const split = (v) => JSON.stringify(v.split("\n").map((s) => s.trim()).filter(Boolean));
    const payload = {
      title: form.title.trim(), slug: form.slug, category: form.category, chip: form.chip || null,
      stockStatus: form.stockStatus, turnaroundDays: Number(form.turnaroundDays) || 0,
      priceINR: Number(form.priceINR), wasINR: form.wasINR ? Number(form.wasINR) : null,
      materials: form.materials.trim() || null, sizeOptions: split(form.sizes), colorOptions: split(form.colours),
      care: form.care.trim() || null, description: form.description.trim() || null,
      images: JSON.stringify(form.images), published: form.published,
    };
    try {
      const res = await fetch("/api/products", {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product ? { id: product.id, ...payload } : payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't save the product");
      onSaved(product ? "Changes saved" : "Product added to the shop");
    } catch (err) {
      onError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    try {
      const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't delete the product");
      onSaved(data.unpublished ? "This piece has orders, so it was hidden from the shop instead" : "Product deleted");
    } catch (err) {
      onError(err.message);
    }
  };

  const field = (k, label, props = {}) => (
    <label className="cfield">
      <span>{label}</span>
      <input value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} {...props} />
      {errors[k] && <em className="admin-field-error">{errors[k]}</em>}
    </label>
  );

  return (
    <>
      <div className={`scrim ${open ? "open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`drawer admin-drawer ${open ? "open" : ""}`} role="dialog" aria-modal="true" aria-label={product ? `Edit ${product.title}` : "Add a product"}>
        <div className="drawer-head">
          <h3>{product ? "Edit product" : "Add a product"}</h3>
          <button className="iconbtn focus-ring" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
        </div>

        <form className="drawer-body admin-drawer-body" onSubmit={save} id="product-form" noValidate>
          <div className="admin-photos">
            <span className="admin-photos-label">Photos{form.images.length > 1 ? " (the first one is the cover)" : ""}</span>
            <div className="admin-photo-grid">
              {form.images.map((src, i) => (
                <div className="admin-photo" key={src + i}>
                  <img src={src} alt="" />
                  <div className="admin-photo-tools">
                    <button type="button" className="iconbtn" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Move photo earlier"><Icon name="chev-right" size={14} style={{ transform: "rotate(180deg)" }} /></button>
                    <button type="button" className="iconbtn" onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))} aria-label="Remove photo"><Icon name="trash" size={14} /></button>
                    <button type="button" className="iconbtn" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} aria-label="Move photo later"><Icon name="chev-right" size={14} /></button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="admin-photo-add"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
              >
                <Icon name="download" size={20} style={{ transform: "rotate(180deg)" }} />
                <span>{uploading ? `Uploading ${uploading}…` : "Upload photos"}</span>
                <small>or drop them here</small>
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
            </div>
            <div className="admin-url-row">
              <input className="admin-url-input" placeholder="Or paste an image link" value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)} />
              <button type="button" className="btn ghost" disabled={!/^(https?:\/\/|\/)/.test(urlDraft.trim())}
                onClick={() => { setForm((f) => ({ ...f, images: [...f.images, urlDraft.trim()] })); setUrlDraft(""); }}>Add link</button>
            </div>
          </div>

          {field("title", "Name", { required: true, placeholder: "e.g. Cherry Keychain" })}
          {field("slug", "Web address", { onChange: (e) => { setSlugTouched(true); set("slug")(e); }, placeholder: "cherry-keychain" })}

          <div className="cgrid">
            {field("priceINR", "Price (₹)", { inputMode: "numeric", placeholder: "180" })}
            {field("wasINR", "Was (₹), for sales", { inputMode: "numeric", placeholder: "Optional" })}
          </div>

          <div className="cgrid">
            <label className="cfield"><span>Collection</span>
              <select value={form.category} onChange={set("category")}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </label>
            <label className="cfield"><span>Label on card</span>
              <select value={form.chip} onChange={set("chip")}>
                {CHIPS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </label>
          </div>

          <fieldset className="admin-segment">
            <legend>Availability</legend>
            <label className={form.stockStatus === "ready" ? "on" : ""}>
              <input type="radio" name="stock" value="ready" checked={form.stockStatus === "ready"} onChange={set("stockStatus")} /> Ready to ship
            </label>
            <label className={form.stockStatus !== "ready" ? "on" : ""}>
              <input type="radio" name="stock" value="made-to-order" checked={form.stockStatus !== "ready"} onChange={set("stockStatus")} /> Made to order
            </label>
          </fieldset>
          {form.stockStatus !== "ready" && field("turnaroundDays", "Days to make", { inputMode: "numeric" })}

          <label className="cfield"><span>Description</span>
            <textarea rows={3} value={form.description} onChange={set("description")} placeholder="What it looks like, what it's for" />
          </label>
          {field("materials", "Materials", { placeholder: "Cotton yarn, key ring" })}
          <div className="cgrid">
            <label className="cfield"><span>Sizes, one per line</span>
              <textarea rows={2} value={form.sizes} onChange={set("sizes")} placeholder={"One size"} />
            </label>
            <label className="cfield"><span>Colours, one per line</span>
              <textarea rows={2} value={form.colours} onChange={set("colours")} placeholder={"Lavender\nPink"} />
            </label>
          </div>
          <label className="cfield"><span>Care</span>
            <textarea rows={2} value={form.care} onChange={set("care")} placeholder="Spot clean only." />
          </label>

          <label className="admin-switch">
            <input type="checkbox" checked={form.published} onChange={set("published")} />
            <span className="admin-switch-track" aria-hidden="true" />
            <span>{form.published ? "Showing in the shop" : "Hidden from the shop"}</span>
          </label>
        </form>

        <div className="drawer-foot admin-drawer-foot">
          {product && (
            <button type="button" className={`btn ghost admin-danger ${confirmDelete ? "armed" : ""}`} onClick={remove}>
              {confirmDelete ? "Tap again to delete" : "Delete"}
            </button>
          )}
          <span style={{ flex: 1 }} />
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button type="submit" form="product-form" className="btn btn-flash" disabled={saving || uploading > 0}>
            {saving ? "Saving…" : product ? "Save changes" : "Add product"}
          </button>
        </div>
      </aside>
    </>
  );
}
