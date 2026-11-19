/**
 * Browser-side Razorpay Checkout helpers: types for window.Razorpay and a
 * one-time loader for checkout.js. Order creation and signature checks live
 * on the server (app/api/razorpay/*).
 */

export interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailure {
  error?: { code?: string; description?: string; reason?: string; source?: string; step?: string };
}

export interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number; // paise
  currency: string;
  name: string;
  description?: string;
  image?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  retry?: { enabled: boolean; max_count?: number };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void; escape?: boolean; confirm_close?: boolean };
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailure) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const SRC = "https://checkout.razorpay.com/v1/checkout.js";
let loading: Promise<boolean> | null = null;

/** Load checkout.js once; resolves false if it can't load (offline, blocked). */
export function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (loading) return loading;
  loading = new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => {
      loading = null; // allow a retry
      script.remove();
      resolve(false);
    };
    document.body.appendChild(script);
  });
  return loading;
}
