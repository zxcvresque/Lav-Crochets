"use client";
// The two full-page states of /checkout: an empty cart, and the order
// confirmation shown after a verified payment (or a refresh with ?placed=).
import Link from "next/link";

export function EmptyCart() {
  return (
    <div className="checkout-page">
      <div className="wrap">
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--fg-muted)" strokeWidth="1.2" style={{ margin: "0 auto 16px" }}>
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--step-4)", fontWeight: 600, marginBottom: 12 }}>Your cart is empty</h2>
          <p style={{ color: "var(--fg-muted)", marginBottom: 24 }}>Add some pieces to your cart to checkout.</p>
          <Link href="/shop" className="btn btn-flash xl">Browse the shop</Link>
        </div>
      </div>
    </div>
  );
}

export function OrderConfirmed({ orderNumber }: { orderNumber: string }) {
  return (
    <div className="checkout-page">
      <div className="wrap">
        <div style={{ textAlign: "center", padding: "64px 0", maxWidth: 520, margin: "0 auto", animation: "rise-in var(--dur-4) var(--ease-out)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "color-mix(in oklch, var(--ok) 12%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", animation: "settle-in var(--dur-3) var(--ease-out) var(--dur-1) both" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--step-8)", fontWeight: 600, marginBottom: 12 }}>
            Order confirmed!
          </h2>
          <p style={{ color: "var(--fg-soft)", marginBottom: 16, lineHeight: 1.6 }}>
            Thank you, truly. Your payment is in and I&rsquo;ve emailed you a confirmation.
            I&rsquo;ll get started on your piece and send the courier details once it ships.
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--brand)", marginBottom: 32 }}>
            Order #{orderNumber}
          </p>
          <div style={{ padding: "20px 24px", background: "var(--bg-subtle)", borderRadius: "var(--r-4)", textAlign: "left", marginBottom: 24 }}>
            <p style={{ fontSize: "var(--step--2)", color: "var(--fg-soft)", lineHeight: 1.6 }}>
              <strong>Delivery:</strong> about 4 to 5 days for ready-to-ship pieces; made-to-order making time comes by email<br />
              <strong>Payment:</strong> Paid securely with Razorpay<br />
              <strong>Questions?</strong> Write to hello@lav-crochets.art. love, Lav
            </p>
          </div>
          <div className="checkout-success-actions">
            <Link href={`/track?order=${encodeURIComponent(orderNumber)}`} className="btn btn-flash xl">Track this order</Link>
            <Link href="/shop" className="btn outline xl">Keep browsing</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
