"use client";
// Razorpay payment flow for /checkout: create (or reuse) the server-priced
// order, open checkout.js, verify the signature on success, and explain every
// failure in plain words.
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadRazorpay, type RazorpaySuccess, type RazorpayFailure } from "@/lib/razorpay";
import type { CartItem } from "@/lib/cart";
import type { BillingInfo, CreatedOrder } from "./checkout-types";

function toE164India(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length === 10) return `+91${d}`;
  if (d.length === 12 && d.startsWith("91")) return `+${d}`;
  return phone.trim();
}

/** Friendly copy for a failed attempt; Razorpay's own reason when it has one. */
function failureMessage(resp?: RazorpayFailure): string {
  const why = resp?.error?.description;
  const base = "That payment didn't go through, and nothing was charged.";
  return why && !/^undefined$/i.test(why) ? `${base} (${why.replace(/\.$/, "")}.) You can try again, or pick another method like UPI or a different card.` : `${base} You can try again, or pick another method like UPI or a different card.`;
}

interface PaymentOptions {
  items: CartItem[];
  billing: BillingInfo;
  /** Applied coupon code, when the server confirmed it. */
  couponCode: string | undefined;
  /** Validates the billing form; payment only starts when it returns true. */
  validate: () => boolean;
  clearCart: () => void;
  /** ?placed=LAV-... from a refreshed confirmation screen. */
  placedParam: string | null;
}

export function useRazorpayPayment({ items, billing, couponCode, validate, clearCart, placedParam }: PaymentOptions) {
  const router = useRouter();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentNotice, setPaymentNotice] = useState("");
  // After a refresh of the confirmation screen, ?placed=LAV-... keeps it showing.
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string } | null>(() =>
    placedParam && /^LAV-[A-Z0-9-]{4,32}$/.test(placedParam) ? { orderNumber: placedParam } : null
  );
  // Reuse the same order if the customer closes the modal and tries again with
  // the same cart and details, instead of creating a new pending order each time.
  const lastOrder = useRef<{ key: string; order: CreatedOrder } | null>(null);

  const verifyPayment = async (order: CreatedOrder, response: RazorpaySuccess) => {
    setPaymentNotice("Confirming your payment...");
    try {
      const verifyRes = await fetch("/api/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
      });
      const verifyData = await verifyRes.json().catch(() => ({}));
      if (verifyRes.ok && verifyData.success) {
        lastOrder.current = null;
        clearCart();
        setOrderSuccess({ orderNumber: verifyData.orderNumber || order.orderNumber });
        router.replace(`/checkout?placed=${encodeURIComponent(verifyData.orderNumber || order.orderNumber)}`, { scroll: true });
        return;
      }
      setPaymentError(
        `Your payment went through, but I couldn't confirm it on my side just yet. Please don't pay again. Write to hello@lav-crochets.art with order ${order.orderNumber} and payment ID ${response.razorpay_payment_id}, and I'll sort it out.`
      );
    } catch {
      setPaymentError(
        `Your payment went through, but the confirmation didn't reach me (connection dropped). Please don't pay again. Your order ${order.orderNumber} will update shortly; if not, email me with payment ID ${response.razorpay_payment_id}.`
      );
    } finally {
      setPaymentNotice("");
      setPaymentLoading(false);
    }
  };

  const handlePay = async () => {
    if (!validate()) return;
    if (items.length === 0) return;

    setPaymentLoading(true);
    setPaymentError("");
    setPaymentNotice("");

    try {
      // Load checkout.js first so a blocked script fails before an order is created.
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        throw new Error("The payment window couldn't load. Check your connection (or turn off an ad blocker for this page) and try again.");
      }

      const key = JSON.stringify({ items: items.map((i) => [i.id, i.quantity]), couponCode, billing });

      let orderData: CreatedOrder;
      if (lastOrder.current && lastOrder.current.key === key) {
        orderData = lastOrder.current.order;
      } else {
        // Amount is priced on the server from the database, never from the cart.
        const orderRes = await fetch("/api/razorpay/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({ id: i.id, qty: i.quantity })),
            couponCode,
            billingInfo: billing,
          }),
        });
        const data = await orderRes.json().catch(() => ({}));
        if (!orderRes.ok) throw new Error(data.error || "I couldn't start the payment. Please try again in a moment.");
        orderData = data;
        lastOrder.current = { key, order: orderData };
      }
      if (!orderData.razorpayKey) throw new Error("Online payment isn't set up yet. Please try again later.");

      const rz = new window.Razorpay({
        key: orderData.razorpayKey,
        order_id: orderData.razorpayOrderId,
        amount: orderData.amount * 100,
        currency: "INR",
        name: "Lav Crochets",
        description: `Order ${orderData.orderNumber}`,
        // Razorpay prefills reliably with the country code; Indian 10-digit numbers get +91.
        prefill: { name: billing.name, email: billing.email, contact: toE164India(billing.phone) },
        notes: { orderNumber: orderData.orderNumber },
        theme: { color: "#a77bd0" },
        retry: { enabled: true, max_count: 3 },
        handler: (response) => { void verifyPayment(orderData, response); },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            setPaymentLoading(false);
            setPaymentNotice("No worries, nothing was charged. Your details are saved here whenever you're ready.");
          },
        },
      });

      rz.on("payment.failed", (resp) => {
        // Razorpay keeps the modal open for a retry; this explains what happened.
        setPaymentError(failureMessage(resp));
      });

      rz.open();
    } catch (err: unknown) {
      setPaymentError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPaymentLoading(false);
    }
  };

  return { paymentLoading, paymentError, paymentNotice, orderSuccess, handlePay };
}
