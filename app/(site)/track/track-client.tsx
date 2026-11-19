"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { fmtPriceINR } from "@/lib/utils";

interface TrackResult {
  orderNumber: string;
  placedAt: string;
  paymentStatus: string;
  orderStatus: string;
  items: { title: string; qty: number }[];
  totalINR: number;
  etaDate: string | null;
  estimatedDelivery: string | null;
  shippedAt: string | null;
  courier: { id: string; name: string } | null;
  trackingNumber: string | null;
  tracking: { courierName: string; primary: string; deepLink: boolean; alt: string | null } | null;
  /** Optional live India Post checkpoints (only when the server flag is on and it worked). */
  live: {
    status: string;
    delivered: boolean;
    events: { date: string; office: string; description: string; status: string }[];
    fetchedAt: string;
  } | null;
}

const STEPS = [
  { key: "placed", label: "Placed", note: "Your order reached me." },
  { key: "confirmed", label: "Confirmed", note: "Payment received, confirmation emailed." },
  { key: "making", label: "Making & packing", note: "Being hooked by hand, or packed if it was ready." },
  { key: "shipped", label: "Shipped", note: "Handed to the courier." },
  { key: "delivered", label: "Delivered", note: "With you. I hope you love it." },
];

const STATUS_STEP: Record<string, number> = { pending: 0, confirmed: 1, making: 2, ready: 2, shipped: 3, delivered: 4 };

const fmtDate = (d: string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(d).toLocaleDateString("en-IN", opts ?? { day: "numeric", month: "long", year: "numeric" });

function etaText(r: TrackResult): string | null {
  if (r.etaDate) return fmtDate(r.etaDate, { weekday: "long", day: "numeric", month: "long" });
  if (r.estimatedDelivery) {
    const d = new Date(r.estimatedDelivery);
    return Number.isNaN(d.getTime()) ? r.estimatedDelivery : fmtDate(r.estimatedDelivery, { weekday: "long", day: "numeric", month: "long" });
  }
  return null;
}

export default function TrackClient({ initialOrder }: { initialOrder: string }) {
  const [order, setOrder] = useState(initialOrder);
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);

  // Coming from the confirmation screen, the order number is already filled in.
  useEffect(() => {
    if (initialOrder) contactRef.current?.focus();
  }, [initialOrder]);

  useEffect(() => {
    if (result) resultRef.current?.focus();
  }, [result]);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    if (!order.trim() || !contact.trim()) {
      setStatus("error");
      setError("Please enter your order number and the email or phone you used.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order, contact }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult(null);
        setStatus("error");
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setResult(data);
      setStatus("idle");
    } catch {
      setStatus("error");
      setError("I couldn't reach the server. Check your connection and try again.");
    }
  }

  async function copyNumber(n: string) {
    try {
      await navigator.clipboard.writeText(n);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the number is still selectable */
    }
  }

  const unpaid = result && result.paymentStatus !== "paid";
  const baseStep = result ? (unpaid ? 0 : STATUS_STEP[result.orderStatus] ?? 1) : 0;
  // India Post saying "delivered" outranks a status I haven't updated yet.
  const current = result?.live?.delivered && baseStep >= 3 ? 4 : baseStep;
  const liveEvents = result && !unpaid ? result.live?.events ?? [] : [];
  const eta = result ? etaText(result) : null;

  return (
    <section className="section page-top trk">
      <div className="wrap trk-wrap">
        <header className="trk-head">
          <h1>Where&rsquo;s my order?</h1>
          <p className="trk-lead">
            Pop in your order number and the email or phone you checked out with. I&rsquo;ll show you where your piece is.
          </p>
        </header>

        <form className="trk-form" onSubmit={lookup} noValidate>
          <label className="cfield">
            <span>Order number</span>
            <input
              name="order"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              placeholder="LAV-20261119-ABC123"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              required
            />
          </label>
          <label className="cfield">
            <span>Email or phone</span>
            <input
              ref={contactRef}
              name="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="you@example.com or 10-digit mobile"
              autoComplete="email"
              required
            />
          </label>
          <button type="submit" className="btn btn-flash trk-submit" disabled={status === "loading"}>
            {status === "loading" ? "Looking..." : "Find my order"}
          </button>
          <p className="trk-error" role="alert" aria-live="polite">{status === "error" ? error : ""}</p>
        </form>

        {result && (
          <article className="trk-card" ref={resultRef} tabIndex={-1} aria-labelledby="trk-title">
            <div className="trk-card-head">
              <div>
                <p className="trk-label">Order</p>
                <h2 id="trk-title" className="trk-num">#{result.orderNumber}</h2>
                <p className="trk-meta">Placed {fmtDate(result.placedAt)} · {fmtPriceINR(result.totalINR)}</p>
              </div>
              {eta && !unpaid && current < 4 && (
                <div className="trk-eta">
                  <p className="trk-label">Expected by</p>
                  <p className="trk-eta-date">{eta}</p>
                </div>
              )}
            </div>

            {unpaid && (
              <p className="trk-note">
                {result.paymentStatus === "failed"
                  ? "The payment for this order didn't go through, so nothing was charged. You can place it again from the shop whenever you like."
                  : "I haven't received the payment for this order yet. If money left your account, it usually shows up here within a few minutes; otherwise write to me and I'll sort it out."}
              </p>
            )}

            <ol className="trk-steps" aria-label="Order progress">
              {STEPS.map((s, i) => {
                const state = i < current ? "done" : i === current ? "now" : "todo";
                return (
                  <li key={s.key} className="trk-step" data-state={state} style={{ ["--i" as string]: i }} aria-current={state === "now" ? "step" : undefined}>
                    <span className="trk-dot" aria-hidden="true">
                      {state === "done" && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                      )}
                    </span>
                    <span className="trk-step-text">
                      <span className="trk-step-label">{s.label}</span>
                      {state === "now" && <span className="trk-step-note">{s.note}</span>}
                      {s.key === "shipped" && result.shippedAt && i <= current && (
                        <span className="trk-step-note">{fmtDate(result.shippedAt, { day: "numeric", month: "long" })}</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>

            {liveEvents.length > 0 && (
              <div className="trk-live">
                <p className="trk-label">
                  <span className="trk-live-dot" aria-hidden="true" /> Live from India Post
                </p>
                <ol className="trk-live-list">
                  {liveEvents.map((ev, i) => {
                    const d = new Date(ev.date);
                    const when = Number.isNaN(d.getTime())
                      ? ev.date
                      : d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
                    return (
                      <li key={i} className="trk-live-ev" style={{ ["--i" as string]: i }}>
                        <span className="trk-live-desc">{ev.description}</span>
                        <span className="trk-live-meta">{[ev.office, when].filter(Boolean).join(" · ")}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {(result.courier || result.trackingNumber) && !unpaid && (
              <div className="trk-ship">
                <p className="trk-label">Courier</p>
                <p className="trk-ship-name">{result.courier && result.courier.id !== "other" ? result.courier.name : "Courier"}</p>
                {result.trackingNumber ? (
                  <>
                    <div className="trk-number-row">
                      <code className="trk-number">{result.trackingNumber}</code>
                      <button type="button" className="trk-copy" onClick={() => copyNumber(result.trackingNumber!)}>
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    {result.tracking && (
                      <div className="trk-links">
                        <a className="btn outline trk-link" href={result.tracking.primary} target="_blank" rel="noopener noreferrer">
                          Track on {result.tracking.courierName}
                        </a>
                        {result.tracking.alt && (
                          <a className="trk-alt" href={result.tracking.alt} target="_blank" rel="noopener noreferrer">
                            Or try the direct tracking link
                          </a>
                        )}
                      </div>
                    )}
                    {result.tracking && !result.tracking.deepLink && (
                      <p className="trk-hint">Paste the number into the {result.tracking.courierName} tracking box. Updates can take a day to appear.</p>
                    )}
                  </>
                ) : (
                  <p className="trk-hint">This one doesn&rsquo;t come with a tracking number, so the date above is my best estimate.</p>
                )}
              </div>
            )}

            <div className="trk-items">
              <p className="trk-label">In this order</p>
              <ul>
                {result.items.map((it, i) => (
                  <li key={i}>{it.title}{it.qty > 1 ? ` × ${it.qty}` : ""}</li>
                ))}
              </ul>
            </div>
          </article>
        )}

        <p className="trk-foot">
          Something not right? <Link href="/contact">Message me</Link> with your order number and I&rsquo;ll help. You can also read how{" "}
          <Link href="/shipping">shipping</Link> works. love, Lav
        </p>
      </div>
    </section>
  );
}
