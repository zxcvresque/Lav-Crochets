"use client";
// Coupon state for /checkout: validates against the server, mirrors the result
// into the cart store, auto-applies ?coupon=CODE once, and re-checks whenever
// the subtotal changes.
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart";
import type { CouponValidation } from "./checkout-types";

export function useCheckoutCoupon(couponParam: string | null) {
  const { coupon, applyCoupon, removeCoupon, getSubtotal, getDiscount } = useCartStore();
  const [couponResult, setCouponResult] = useState<CouponValidation | null>(null);
  const [autoCouponAttempted, setAutoCouponAttempted] = useState(false);

  const subtotal = getSubtotal();
  const discount = couponResult?.valid ? couponResult.discountINR : getDiscount();
  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async (code: string) => {
    if (!code.trim()) return;
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${subtotal}`);
      const data = await res.json();
      setCouponResult(data);
      if (data.valid) {
        applyCoupon({ code: data.code, discount: data.value, type: data.type });
      } else {
        removeCoupon();
      }
    } catch {
      setCouponResult({ valid: false, code, discountINR: 0, type: "flat", message: "Failed to validate coupon" });
    }
  };

  // Auto-apply coupon from URL on mount
  useEffect(() => {
    if (couponParam && !autoCouponAttempted) {
      setAutoCouponAttempted(true);
      handleApplyCoupon(couponParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponParam, autoCouponAttempted]);

  // Re-validate an applied coupon whenever the cart subtotal changes.
  useEffect(() => {
    if (coupon?.code) handleApplyCoupon(coupon.code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponResult(null);
  };

  return {
    coupon,
    couponResult,
    subtotal,
    discount,
    total,
    appliedCode: couponResult?.valid ? couponResult.code : undefined,
    handleApplyCoupon,
    handleRemoveCoupon,
  };
}
