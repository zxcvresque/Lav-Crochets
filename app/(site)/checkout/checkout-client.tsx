"use client";
// /checkout: composes the billing form, order summary, coupon and Razorpay
// payment hooks. Styles: app/styles/pages/checkout.css.
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/lib/cart";
import { EMPTY_BILLING, validateBilling, type BillingErrors, type BillingInfo } from "./checkout-types";
import { useCheckoutCoupon } from "./use-checkout-coupon";
import { useRazorpayPayment } from "./use-razorpay-payment";
import { BillingForm, PayPanel } from "./checkout-form";
import { OrderSummary } from "./checkout-summary";
import { EmptyCart, OrderConfirmed } from "./checkout-screens";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [billing, setBilling] = useState<BillingInfo>(EMPTY_BILLING);
  const [errors, setErrors] = useState<BillingErrors>({});

  const coupon = useCheckoutCoupon(searchParams.get("coupon"));

  const validate = (): boolean => {
    const found = validateBilling(billing);
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const payment = useRazorpayPayment({
    items,
    billing,
    couponCode: coupon.appliedCode,
    validate,
    clearCart,
    placedParam: searchParams.get("placed"),
  });

  // Prefill from the signed-in account (and its last order) when fields are empty.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/account")
      .then((r) => (r.ok ? r.json() : null))
      .then((acc) => {
        if (cancelled || !acc) return;
        const last = Array.isArray(acc.orders) ? acc.orders[0] : null;
        setBilling((b) => ({
          name: b.name || acc.name || last?.customerName || "",
          email: b.email || acc.email || "",
          phone: b.phone || last?.customerPhone || "",
          address: b.address || last?.shippingAddress || "",
          city: b.city || last?.city || "",
          state: b.state || last?.state || "",
          pincode: b.pincode || last?.pincode || "",
        }));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleBillingChange = (field: keyof BillingInfo) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setBilling(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  if (items.length === 0 && !payment.orderSuccess) return <EmptyCart />;
  if (payment.orderSuccess) return <OrderConfirmed orderNumber={payment.orderSuccess.orderNumber} />;

  return (
    <div className="checkout-page">
      <div className="wrap">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Almost there. Pay securely with Razorpay (UPI, cards, netbanking), and I&rsquo;ll take it from here.</p>
        </div>

        <div className="checkout-layout">
          <div className="checkout-form-col">
            <BillingForm billing={billing} errors={errors} onChange={handleBillingChange} />
            <PayPanel
              total={coupon.total}
              loading={payment.paymentLoading}
              error={payment.paymentError}
              notice={payment.paymentNotice}
              onPay={payment.handlePay}
            />
          </div>

          <OrderSummary
            items={items}
            subtotal={coupon.subtotal}
            discount={coupon.discount}
            total={coupon.total}
            couponResult={coupon.couponResult}
            storedCouponCode={coupon.coupon?.code}
            appliedCode={coupon.appliedCode}
            onApplyCoupon={coupon.handleApplyCoupon}
            onRemoveCoupon={coupon.handleRemoveCoupon}
          />
        </div>
      </div>
    </div>
  );
}

const checkoutFallback = (
  <div style={{ padding: "96px 0", textAlign: "center", color: "var(--fg-muted)" }}>Loading...</div>
);

export default function CheckoutClient() {
  // The cart lives in localStorage, so render it only in the browser (the server
  // can't know it, and a server/browser mismatch would break hydration).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return checkoutFallback;
  return (
    <Suspense fallback={checkoutFallback}>
      <CheckoutContent />
    </Suspense>
  );
}
