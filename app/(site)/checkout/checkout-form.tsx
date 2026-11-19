"use client";
// Left column of /checkout: billing + shipping fields, what happens next,
// and the pay button with its notices.
import Link from "next/link";
import { fmtPriceINR } from "@/lib/utils";
import type { BillingErrors, BillingInfo } from "./checkout-types";

type FieldChange = (field: keyof BillingInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;

export function BillingForm({ billing, errors, onChange }: { billing: BillingInfo; errors: BillingErrors; onChange: FieldChange }) {
  return (
    <>
      {/* Contact info */}
      <section className="checkout-section">
        <h2 className="checkout-section-title">Where I can reach you</h2>
        <div className="form-grid">
          <label className="cfield full">
            <span>Your name *</span>
            <input id="name" name="name" autoComplete="name" type="text" value={billing.name} onChange={onChange("name")} placeholder="Your full name" aria-invalid={!!errors.name} />
            {errors.name && <em className="field-error">{errors.name}</em>}
          </label>
          <label className="cfield">
            <span>Email *</span>
            <input id="email" name="email" autoComplete="email" type="email" inputMode="email" value={billing.email} onChange={onChange("email")} placeholder="you@example.com" aria-invalid={!!errors.email} />
            {errors.email && <em className="field-error">{errors.email}</em>}
          </label>
          <label className="cfield">
            <span>Phone *</span>
            <input id="phone" name="phone" autoComplete="tel" type="tel" inputMode="tel" value={billing.phone} onChange={onChange("phone")} placeholder="10-digit mobile" aria-invalid={!!errors.phone} />
            {errors.phone && <em className="field-error">{errors.phone}</em>}
          </label>
        </div>
      </section>

      {/* Shipping */}
      <section className="checkout-section">
        <h2 className="checkout-section-title">Where it&rsquo;s going</h2>
        <div className="form-grid">
          <label className="cfield full">
            <span>Address *</span>
            <textarea id="address" name="address" autoComplete="street-address" value={billing.address} onChange={onChange("address")} placeholder="House, street, area, landmark" rows={3} aria-invalid={!!errors.address} />
            {errors.address && <em className="field-error">{errors.address}</em>}
          </label>
          <label className="cfield">
            <span>City *</span>
            <input id="city" name="city" autoComplete="address-level2" type="text" value={billing.city} onChange={onChange("city")} placeholder="City" aria-invalid={!!errors.city} />
            {errors.city && <em className="field-error">{errors.city}</em>}
          </label>
          <label className="cfield">
            <span>State *</span>
            <input id="state" name="state" autoComplete="address-level1" type="text" value={billing.state} onChange={onChange("state")} placeholder="State" aria-invalid={!!errors.state} />
            {errors.state && <em className="field-error">{errors.state}</em>}
          </label>
          <label className="cfield">
            <span>Pincode *</span>
            <input id="pincode" name="pincode" autoComplete="postal-code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={billing.pincode} onChange={onChange("pincode")} placeholder="6 digits" aria-invalid={!!errors.pincode} />
            {errors.pincode && <em className="field-error">{errors.pincode}</em>}
          </label>
        </div>
      </section>

      {/* What happens next */}
      <section className="checkout-next" aria-labelledby="next-title">
        <h2 id="next-title" className="checkout-section-title">What happens next</h2>
        <ol>
          <li><span>I confirm your order by email.</span></li>
          <li><span>I hook your piece (or pack it, if it&rsquo;s ready to ship).</span></li>
          <li><span>It&rsquo;s posted to you and delivered in 4 to 5 days.</span></li>
        </ol>
      </section>
    </>
  );
}

export function PayPanel({ total, loading, error, notice, onPay }: { total: number; loading: boolean; error: string; notice: string; onPay: () => void }) {
  return (
    <div>
      {notice && !error && (
        <p className="payment-notice" role="status">{notice}</p>
      )}
      {error && (
        <div className="payment-error" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          {error}
        </div>
      )}
      <button className="btn btn-flash xl checkout-pay" onClick={onPay} disabled={loading}>
        {loading ? (
          "Opening secure payment..."
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
            Pay {fmtPriceINR(total)}
          </>
        )}
      </button>
      <p className="checkout-pay-note">
        Pay securely with Razorpay (UPI, cards, netbanking).
      </p>
      <p className="checkout-legal">
        By paying you agree to the <Link href="/terms">Terms</Link> &amp; <Link href="/privacy">Privacy</Link> policy.
        {" "}See <Link href="/shipping">shipping</Link> and <Link href="/returns">returns</Link>.
      </p>
      <p className="checkout-trust">
        Every piece is hooked by hand by me, Lav, in Chhatrapati Sambhajinagar. Stuck on anything?{" "}
        <Link href="/contact">Message me</Link> or write to{" "}
        <a href="mailto:hello@lav-crochets.art">hello@lav-crochets.art</a>. Love, Lav
      </p>
    </div>
  );
}
