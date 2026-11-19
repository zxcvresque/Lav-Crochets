"use client";

import { useState, useEffect } from "react";
import { fmtPriceINR } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  type: "flat" | "percent";
  value: number;
  minOrderINR: number;
  usageLimit: number | null;
  perUserLimit: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
  _count: { usages: number };
}

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://lav-crochets.art";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    code: "",
    type: "flat" as "flat" | "percent",
    value: 0,
    minOrderINR: 0,
    usageLimit: 0,
    perUserLimit: 1,
    expiresAt: "",
    active: true,
  });

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function loadCoupons() {
    setLoading(true);
    const res = await fetch("/api/coupons");
    const data = await res.json();
    setCoupons(data);
    setLoading(false);
  }

  useEffect(() => { loadCoupons(); }, []);

  function resetForm() {
    setForm({ code: "", type: "flat", value: 0, minOrderINR: 0, usageLimit: 0, perUserLimit: 1, expiresAt: "", active: true });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code) return showToast("Code is required", false);
    if (!form.value) return showToast("Value is required", false);

    setSaving(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: form.value,
          minOrderINR: form.minOrderINR || 0,
          usageLimit: form.usageLimit || null,
          perUserLimit: form.perUserLimit || 1,
          expiresAt: form.expiresAt || null,
          active: form.active,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create coupon");
      showToast(`Coupon "${data.code}" created!`);
      setShowForm(false);
      resetForm();
      loadCoupons();
    } catch (e) {
      showToast((e as Error).message, false);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: Coupon) {
    const res = await fetch("/api/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, active: !c.active }),
    });
    if (!res.ok) { showToast("Failed to update coupon", false); return; }
    setCoupons((cs) => cs.map((x) => x.id === c.id ? { ...x, active: !x.active } : x));
    showToast(`Coupon ${c.active ? "deactivated" : "activated"}`);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/coupons?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      showToast("Coupon deleted");
      loadCoupons();
    } catch (e) {
      showToast("Delete failed: " + (e as Error).message, false);
    } finally {
      setDeletingId(null);
    }
  }

  function copyLink(code: string) {
    navigator.clipboard.writeText(`${SITE_URL}/checkout?coupon=${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  const activeCoupons = coupons.filter((c) => c.active);
  const inactiveCoupons = coupons.filter((c) => !c.active);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Coupons</h1>
          <p className="admin-page-sub">{activeCoupons.length} active coupon{activeCoupons.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn btn-flash" onClick={() => { resetForm(); setShowForm(true); }}>
          <PlusIcon /> Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="admin-loading-center">Loading...</div>
      ) : coupons.length === 0 ? (
        <div className="admin-empty-state">
          <p>No coupons yet. Create one to offer discounts to your customers.</p>
          <button className="btn outline" onClick={() => { resetForm(); setShowForm(true); }}>Create your first coupon</button>
        </div>
      ) : (
        <div className="admin-coupon-list">
          {/* Active */}
          {activeCoupons.length > 0 && (
            <>
              <h3 className="admin-coupon-section-title">Active</h3>
              {activeCoupons.map((c) => (
                <CouponCard
                  key={c.id}
                  coupon={c}
                  onToggle={toggleActive}
                  onDelete={handleDelete}
                  onCopyLink={copyLink}
                  copied={copied === c.code}
                  deletingId={deletingId}
                />
              ))}
            </>
          )}

          {/* Inactive */}
          {inactiveCoupons.length > 0 && (
            <>
              <h3 className="admin-coupon-section-title" style={{ marginTop: "24px" }}>Inactive</h3>
              {inactiveCoupons.map((c) => (
                <CouponCard
                  key={c.id}
                  coupon={c}
                  onToggle={toggleActive}
                  onDelete={handleDelete}
                  onCopyLink={copyLink}
                  copied={copied === c.code}
                  deletingId={deletingId}
                  inactive
                />
              ))}
            </>
          )}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>Create coupon</h2>
              <button className="admin-modal-close" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-body">
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Code *</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") }))}
                    placeholder="e.g. HAPPY50"
                    required
                    style={{ fontFamily: "var(--font-mono)", fontWeight: 600, letterSpacing: "0.05em" }}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "flat" | "percent" }))}>
                    <option value="flat">Flat (₹)</option>
                    <option value="percent">Percent (%)</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Value *</label>
                  <input type="number" min={1} value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: +e.target.value }))} required placeholder={form.type === "percent" ? "e.g. 10" : "e.g. 50"} />
                </div>
                <div className="admin-form-group">
                  <label>Min Order (₹)</label>
                  <input type="number" min={0} value={form.minOrderINR} onChange={(e) => setForm((f) => ({ ...f, minOrderINR: +e.target.value }))} placeholder="0 = no minimum" />
                </div>
                <div className="admin-form-group">
                  <label>Total uses allowed</label>
                  <input type="number" min={0} value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: +e.target.value }))} placeholder="Empty = unlimited" />
                </div>
                <div className="admin-form-group">
                  <label>Per-User Limit</label>
                  <input type="number" min={1} value={form.perUserLimit} onChange={(e) => setForm((f) => ({ ...f, perUserLimit: +e.target.value }))} />
                </div>
                <div className="admin-form-group">
                  <label>Expires on</label>
                  <input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
                </div>
                <div className="admin-form-group full">
                  <label className="admin-toggle-row">
                    <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                    Active immediately
                  </label>
                </div>
              </div>

              {/* Preview */}
              <div className="admin-coupon-preview">
                <div className="admin-coupon-preview-code">{form.code || "CODE"}</div>
                <div className="admin-coupon-preview-value">
                  {form.type === "flat" ? `₹${form.value}` : `${form.value}%`}{form.type === "percent" ? " off" : " off"}
                </div>
                {form.minOrderINR > 0 && <div style={{ fontSize: "var(--step--3)", color: "var(--fg-muted)", marginTop: "4px" }}>Min order {fmtPriceINR(form.minOrderINR)}</div>}
              </div>

              <div className="admin-modal-foot">
                <button type="button" className="btn outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-flash" disabled={saving}>
                  {saving ? "Creating..." : "Create coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className={`admin-toast ${toast.ok ? "ok" : "err"}`}>{toast.msg}</div>}
    </div>
  );
}

// ── Coupon card sub-component ──────────────────────────────────────────────

interface CouponCardProps {
  coupon: Coupon;
  onToggle: (c: Coupon) => void;
  onDelete: (id: string) => void;
  onCopyLink: (code: string) => void;
  copied: boolean;
  deletingId: string | null;
  inactive?: boolean;
}

function CouponCard({ coupon, onToggle, onDelete, onCopyLink, copied, deletingId, inactive }: CouponCardProps) {
  const discountLabel = coupon.type === "flat" ? `₹${coupon.value} off` : `${coupon.value}% off`;

  return (
    <div className={`admin-coupon-card ${inactive ? "inactive" : ""}`}>
      <div className="admin-coupon-icon">
        <CouponIcon />
      </div>
      <div className="admin-coupon-info">
        <div className="admin-coupon-code">{coupon.code}</div>
        <div className="admin-coupon-value">{discountLabel}{coupon.minOrderINR > 0 ? ` · min ${fmtPriceINR(coupon.minOrderINR)}` : ""}</div>
        <div className="admin-coupon-meta">
          <span className={`admin-coupon-badge ${coupon._count.usages > 0 ? "used" : ""}`}>
            {coupon._count.usages} use{coupon._count.usages !== 1 ? "s" : ""}
          </span>
          {coupon.usageLimit && <span className="admin-coupon-badge">{coupon.usageLimit} limit</span>}
          {coupon.expiresAt && <span className="admin-coupon-badge">Expires {new Date(coupon.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
          {coupon.perUserLimit > 1 && <span className="admin-coupon-badge">{coupon.perUserLimit}/user</span>}
        </div>
      </div>
      <div className="admin-coupon-actions">
        <button className={`admin-coupon-link-btn ${copied ? "copied" : ""}`} onClick={() => onCopyLink(coupon.code)}>
          {copied ? <CheckIcon /> : <LinkIcon />}
          {copied ? "Copied!" : "Copy link"}
        </button>
        <button className="btn outline" style={{ height: "34px", padding: "0 12px", fontSize: "var(--step--3)" }} onClick={() => onToggle(coupon)}>
          {coupon.active ? "Deactivate" : "Activate"}
        </button>
        <button
          className="btn outline"
          style={{ height: "34px", padding: "0 12px", fontSize: "var(--step--3)", color: "var(--bad)", borderColor: "oklch(0.62 0.2 22 / 0.3)" }}
          onClick={() => onDelete(coupon.id)}
          disabled={deletingId === coupon.id}
        >
          {deletingId === coupon.id ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function CouponIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
}
function LinkIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
}
function CheckIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
