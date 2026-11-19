"use client";
// Right column of /checkout: the order summary. A <details> so it can
// collapse above the form on tablets and phones (open by default on desktop).
import { useState } from "react";
import { fmtPriceINR } from "@/lib/utils";
import { CouponInput } from "@/components/CouponInput";
import type { CartItem } from "@/lib/cart";
import type { CouponValidation } from "./checkout-types";

interface SummaryProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponResult: CouponValidation | null;
  storedCouponCode: string | undefined;
  appliedCode: string | undefined;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
}

export function OrderSummary({ items, subtotal, discount, total, couponResult, storedCouponCode, appliedCode, onApplyCoupon, onRemoveCoupon }: SummaryProps) {
  // Open on desktop, collapsed above the form on smaller screens.
  const [open, setOpen] = useState(() => typeof window === "undefined" || window.matchMedia("(min-width: 1025px)").matches);
  return (
    <div className="checkout-summary-col">
      <details className="checkout-summary" open={open} onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
        <summary className="checkout-summary-title">
          <span>Your order</span>
          <span className="checkout-summary-peek">{fmtPriceINR(total)}</span>
        </summary>

        {/* Items */}
        <div className="checkout-items">
          {items.map((item) => (
            <div key={item.id} className="checkout-item">
              <div className="checkout-item-thumb">
                {item.image ? <img src={item.image} alt={item.title} /> : <div className="ph" />}
                <span className="checkout-item-qty">{item.quantity}</span>
              </div>
              <div className="checkout-item-info">
                <span className="checkout-item-title">{item.title}</span>
                <span className="checkout-item-meta">{item.stockStatus === "ready" ? "Ready to ship" : "Made to order"}</span>
              </div>
              <span className="checkout-item-price">{fmtPriceINR(item.priceINR * item.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <div className="checkout-coupon">
          <CouponInput onApply={onApplyCoupon} onRemove={onRemoveCoupon} appliedCode={appliedCode} />
          {couponResult?.message && !couponResult.valid && (
            <p className="coupon-note bad">{couponResult.message}</p>
          )}
          {couponResult?.valid && (
            <p className="coupon-note ok">{couponResult.message}</p>
          )}
        </div>

        {/* Totals */}
        <div className="checkout-totals">
          <div className="row-t">
            <span>Subtotal</span>
            <span>{fmtPriceINR(subtotal)}</span>
          </div>
          {(discount > 0 || couponResult?.valid) && (
            <div className="row-t discount">
              <span>Discount ({couponResult?.code || storedCouponCode})</span>
              <span>-{fmtPriceINR(discount)}</span>
            </div>
          )}
          <div className="row-t">
            <span>Shipping</span>
            <span className="mono">Included</span>
          </div>
          <div className="row-t grand">
            <span>Total</span>
            <span>{fmtPriceINR(total)}</span>
          </div>
        </div>
      </details>
    </div>
  );
}
