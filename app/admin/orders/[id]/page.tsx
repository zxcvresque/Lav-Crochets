"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fmtPriceINR } from "@/lib/utils";
import { COURIERS, getCourier, trackingLinks } from "@/lib/couriers";

interface OrderItem {
  id: string;
  title: string;
  priceINR: number;
  qty: number;
  options: string | null;
  product: { title: string; images: string | null };
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string | null;
  city: string | null;
  pincode: string | null;
  subtotalINR: number;
  discountINR: number;
  totalINR: number;
  couponCode: string | null;
  orderStatus: string;
  paymentStatus: string;
  razorpayOrderId: string | null;
  estimatedDelivery: string | null;
  courier: string | null;
  trackingNumber: string | null;
  etaDate: string | null;
  shippedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

const STATUS_FLOW = ["pending", "confirmed", "making", "ready", "shipped", "delivered"] as const;
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  making: "Making",
  ready: "Ready",
  shipped: "Shipped",
  delivered: "Delivered",
};

/** ISO date -> yyyy-mm-dd for <input type="date">. */
const toDateInput = (d: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [ship, setShip] = useState({ courier: "", trackingNumber: "", etaDate: "", shippedAt: "" });
  const [savingShip, setSavingShip] = useState(false);

  // Delay modal state
  const [showDelay, setShowDelay] = useState(false);
  const [delayMessage, setDelayMessage] = useState("");
  const [delayDate, setDelayDate] = useState("");
  const [sendingDelay, setSendingDelay] = useState(false);

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setOrder(data);
          setNotes(data.notes ?? "");
          setShip({
            courier: data.courier ?? "",
            trackingNumber: data.trackingNumber ?? "",
            etaDate: toDateInput(data.etaDate),
            shippedAt: toDateInput(data.shippedAt),
          });
        }
        setLoading(false);
      });
  }, [id]);

  async function updateStatus(newStatus: string) {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setOrder((o) => o ? { ...o, orderStatus: updated.orderStatus, shippedAt: updated.shippedAt } : o);
      if (updated.shippedAt) setShip((sh) => ({ ...sh, shippedAt: sh.shippedAt || toDateInput(updated.shippedAt) }));
      showToast("Status updated to " + STATUS_LABELS[newStatus]);
    } catch (e) {
      showToast("Failed to update status: " + (e as Error).message, false);
    } finally {
      setUpdating(false);
    }
  }

  async function saveNotes() {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error(await res.text());
      showToast("Notes saved");
    } catch (e) {
      showToast("Failed to save notes", false);
    } finally {
      setSavingNotes(false);
    }
  }

  async function saveShipping(e: React.FormEvent) {
    e.preventDefault();
    setSavingShip(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courier: ship.courier || null,
          trackingNumber: ship.trackingNumber || null,
          etaDate: ship.etaDate || null,
          shippedAt: ship.shippedAt || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
      const updated = await res.json();
      setOrder((o) => o ? { ...o, courier: updated.courier, trackingNumber: updated.trackingNumber, etaDate: updated.etaDate, shippedAt: updated.shippedAt } : o);
      setShip((sh) => ({ ...sh, trackingNumber: updated.trackingNumber ?? "" }));
      showToast("Shipping details saved");
    } catch (err) {
      showToast("Couldn't save shipping: " + (err as Error).message, false);
    } finally {
      setSavingShip(false);
    }
  }

  async function sendDelayEmail() {
    setSendingDelay(true);
    try {
      const res = await fetch(`/api/orders/${id}/send-delay-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customMessage: delayMessage, newEstimatedDelivery: delayDate || undefined }),
      });
      if (!res.ok) throw new Error(await res.text());

      // Also update estimated delivery in DB if date was set
      if (delayDate) {
        await fetch(`/api/orders/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estimatedDelivery: delayDate }),
        });
      }

      showToast("Delay email sent to " + (order?.customerEmail ?? "customer"));
      setShowDelay(false);
      setDelayMessage("");
      setDelayDate("");
    } catch (e) {
      showToast("Failed to send delay email: " + (e as Error).message, false);
    } finally {
      setSendingDelay(false);
    }
  }

  if (loading) return <div className="admin-loading-center">Loading order...</div>;
  if (notFound || !order) return <div className="admin-loading-center">Order not found.</div>;

  const currentStatusIdx = STATUS_FLOW.indexOf(order.orderStatus as typeof STATUS_FLOW[number]);

  return (
    <div>
      {/* Header */}
      <div className="admin-detail-header">
        <div>
          <div className="admin-breadcrumb">
            <Link href="/admin/orders" className="admin-back-link">Orders</Link>
            <span>/</span>
            <span>#{order.orderNumber}</span>
          </div>
          <h1 className="admin-page-title">Order #{order.orderNumber}</h1>
          <p className="admin-page-sub">
            Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {" · "}
            <span className="admin-status-chip" data-status={`pay-${order.paymentStatus}`}>
              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)} payment
            </span>
          </p>
        </div>
      </div>

      <div className="admin-detail-grid">
        {/* Left column */}
        <div className="admin-detail-col">
          {/* Status progress */}
          <div className="admin-card">
            <h3 className="admin-card-title">Order status</h3>
            <div className="admin-status-flow">
              {STATUS_FLOW.map((s, i) => (
                <div key={s} className="admin-status-step">
                  <button
                    className={`admin-status-node ${order.orderStatus === s ? "active" : ""} ${i < currentStatusIdx ? "done" : ""}`}
                    onClick={() => updateStatus(s)}
                    disabled={updating}
                    title={STATUS_LABELS[s]}
                  >
                    {i < currentStatusIdx ? <CheckIcon /> : null}
                    {order.orderStatus === s && !updating ? null : order.orderStatus === s ? <SpinnerIcon /> : null}
                  </button>
                  <span className={`admin-status-label ${order.orderStatus === s ? "active" : ""}`}>{STATUS_LABELS[s]}</span>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={`admin-status-line ${i < currentStatusIdx ? "done" : ""}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="admin-card">
            <h3 className="admin-card-title">Items</h3>
            <div className="admin-items">
              {order.items.map((item) => (
                <div key={item.id} className="admin-item-row">
                  <div className="admin-item-thumb">
                    {item.product?.images ? (
                      <img src={JSON.parse(item.product.images)[0]} alt={item.title} />
                    ) : (
                      <div className="admin-item-placeholder" />
                    )}
                  </div>
                  <div className="admin-item-info">
                    <div className="admin-item-title">{item.title}</div>
                    {item.options && <div style={{ fontSize: "var(--step--3)", color: "var(--fg-muted)" }}>{item.options}</div>}
                    <div style={{ fontSize: "var(--step--3)", color: "var(--fg-muted)" }}>Qty: {item.qty}</div>
                  </div>
                  <div className="admin-item-price">{fmtPriceINR(item.priceINR * item.qty)}</div>
                </div>
              ))}
            </div>
            <div className="admin-totals">
              <div className="admin-total-row"><span>Subtotal</span><span>{fmtPriceINR(order.subtotalINR)}</span></div>
              {order.discountINR > 0 && (
                <div className="admin-total-row" style={{ color: "var(--ok)" }}>
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span>-{fmtPriceINR(order.discountINR)}</span>
                </div>
              )}
              <div className="admin-total-row grand"><span>Total</span><span>{fmtPriceINR(order.totalINR)}</span></div>
            </div>
          </div>

          {/* Notes */}
          <div className="admin-card">
            <h3 className="admin-card-title">Private notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add notes about this order..."
              className="admin-textarea"
            />
            <button className="btn outline" style={{ marginTop: "10px", height: "36px", padding: "0 16px", fontSize: "var(--step--2)" }} onClick={saveNotes} disabled={savingNotes}>
              {savingNotes ? "Saving..." : "Save notes"}
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="admin-detail-col">
          {/* Customer info */}
          <div className="admin-card">
            <h3 className="admin-card-title">Customer</h3>
            <div className="admin-info-grid">
              <div className="admin-info-item">
                <span className="admin-info-label">Name</span>
                <span className="admin-info-value">{order.customerName}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Email</span>
                <a href={`mailto:${order.customerEmail}`} className="admin-info-value" style={{ color: "var(--brand)" }}>{order.customerEmail}</a>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Phone</span>
                <span className="admin-info-value">{order.customerPhone}</span>
              </div>
              {order.shippingAddress && (
                <div className="admin-info-item" style={{ gridColumn: "1/-1" }}>
                  <span className="admin-info-label">Address</span>
                  <span className="admin-info-value">
                    {order.shippingAddress}{order.city ? `, ${order.city}` : ""}{order.pincode ? ` ${order.pincode}` : ""}
                  </span>
                </div>
              )}
              {order.razorpayOrderId && (
                <div className="admin-info-item" style={{ gridColumn: "1/-1" }}>
                  <span className="admin-info-label">Razorpay Order ID</span>
                  <span className="admin-info-value" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--step--3)" }}>{order.razorpayOrderId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping */}
          <form className="admin-card admin-ship" onSubmit={saveShipping}>
            <h3 className="admin-card-title">Shipping</h3>
            <p className="admin-ship-hint">
              Customers see this on /track. Add a tracking number only if the courier gave one; otherwise the ETA is enough.
            </p>
            <div className="admin-ship-grid">
              <div className="admin-form-group">
                <label htmlFor="ship-courier">Courier</label>
                <select id="ship-courier" className="admin-input" value={ship.courier} onChange={(e) => setShip({ ...ship, courier: e.target.value })}>
                  <option value="">Not set</option>
                  {COURIERS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label htmlFor="ship-number">Tracking number (optional)</label>
                <input
                  id="ship-number"
                  className="admin-input"
                  value={ship.trackingNumber}
                  onChange={(e) => setShip({ ...ship, trackingNumber: e.target.value.toUpperCase() })}
                  placeholder={getCourier(ship.courier)?.numberExample ?? "If the courier gave one"}
                  spellCheck={false}
                  autoComplete="off"
                />
                {(() => {
                  const c = getCourier(ship.courier);
                  const n = ship.trackingNumber.trim();
                  return c?.numberPattern && n && !c.numberPattern.test(n)
                    ? <span className="admin-ship-warn">Doesn&rsquo;t look like a {c.name} number (e.g. {c.numberExample}). Saving anyway is fine.</span>
                    : null;
                })()}
              </div>
              <div className="admin-form-group">
                <label htmlFor="ship-eta">Expected delivery</label>
                <input id="ship-eta" type="date" className="admin-input" value={ship.etaDate} onChange={(e) => setShip({ ...ship, etaDate: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label htmlFor="ship-date">Shipped on</label>
                <input id="ship-date" type="date" className="admin-input" value={ship.shippedAt} onChange={(e) => setShip({ ...ship, shippedAt: e.target.value })} />
              </div>
            </div>
            <div className="admin-ship-foot">
              <button type="submit" className="btn outline" style={{ height: "36px", padding: "0 16px", fontSize: "var(--step--2)" }} disabled={savingShip}>
                {savingShip ? "Saving..." : "Save shipping"}
              </button>
              {(() => {
                const links = trackingLinks(order.courier, order.trackingNumber);
                return links ? (
                  <a href={links.alt || links.primary} target="_blank" rel="noopener noreferrer" className="admin-view-link">Check on {links.courierName}</a>
                ) : null;
              })()}
            </div>
            <p className="admin-ship-hint" style={{ marginTop: 10 }}>
              Tip: save these first, then mark the order Shipped so the email includes them.
            </p>
          </form>

          {/* Actions */}
          <div className="admin-card">
            <h3 className="admin-card-title">Actions</h3>
            <div className="admin-action-btns">
              <button
                className="btn outline"
                style={{ height: "40px", padding: "0 20px", fontSize: "var(--step--1)", color: "#E6A817", borderColor: "oklch(0.78 0.15 75 / 0.4)" }}
                onClick={() => setShowDelay(true)}
              >
                <MailIcon /> Send Delay Email
              </button>
            </div>
            {order.estimatedDelivery && (
              <div style={{ marginTop: "12px", fontSize: "var(--step--2)", color: "var(--fg-muted)" }}>
                Current estimate: <strong style={{ color: "var(--fg-soft)" }}>{new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delay email modal */}
      {showDelay && (
        <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDelay(false); }}>
          <div className="admin-modal" style={{ maxWidth: 480 }}>
            <div className="admin-modal-header">
              <h2>Email the customer an update</h2>
              <button className="admin-modal-close" onClick={() => setShowDelay(false)}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <p style={{ fontSize: "var(--step--1)", color: "var(--fg-muted)", marginBottom: "16px" }}>
                Sending to <strong style={{ color: "var(--fg)" }}>{order.customerEmail}</strong>
              </p>
              <div className="admin-form-group" style={{ marginBottom: "16px" }}>
                <label>Custom Message (optional)</label>
                <textarea
                  value={delayMessage}
                  onChange={(e) => setDelayMessage(e.target.value)}
                  rows={4}
                  placeholder="E.g. We're running a day behind due to a yarn restock, but your piece is looking beautiful..."
                  className="admin-textarea"
                />
              </div>
              <div className="admin-form-group">
                <label>New Estimated Delivery Date (optional)</label>
                <input type="date" value={delayDate} onChange={(e) => setDelayDate(e.target.value)} className="admin-input" />
              </div>
            </div>
            <div className="admin-modal-foot">
              <button className="btn outline" onClick={() => setShowDelay(false)}>Cancel</button>
              <button className="btn btn-flash" onClick={sendDelayEmail} disabled={sendingDelay}>
                {sendingDelay ? "Sending..." : "Send email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`admin-toast ${toast.ok ? "ok" : "err"}`}>{toast.msg}</div>
      )}
    </div>
  );
}

function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function SpinnerIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" strokeOpacity="0.3"/><path d="M12 3a9 9 0 0 1 9 9"/></svg>;
}
function MailIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}
