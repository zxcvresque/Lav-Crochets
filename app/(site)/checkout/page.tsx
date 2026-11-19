import type { Metadata } from "next";
import CheckoutClient from "./checkout-client";

export const metadata: Metadata = {
  title: "Checkout — Lav Crochets",
  description: "Pay securely with Razorpay (UPI, cards, netbanking). Handmade in Chhatrapati Sambhajinagar, delivered in 4 to 5 days.",
};

export default function Page() {
  return <CheckoutClient />;
}
