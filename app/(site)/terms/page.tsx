import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/site";
import { PolicyPage } from "@/components/site/policy-page";

export const metadata: Metadata = pageMeta({
  title: "Terms — Lav Crochets",
  description: "The simple terms for ordering handmade crochet from Lav Crochets: orders, pricing, payment, making time and delivery.",
  path: "/terms",
});

export default function Page() {
  return (
    <PolicyPage
      title="Terms"
      path="/terms"
      updated="19 November 2026"
      intro="The short version of how ordering from me works. By placing an order you agree to these."
      sections={[
        {
          heading: "Orders",
          body: <p>Your order is confirmed once payment goes through and you get my confirmation email. If I can&rsquo;t make something (say a yarn runs out), I&rsquo;ll tell you and refund you in full.</p>,
        },
        {
          heading: "Prices & payment",
          body: <p>Prices are in Indian rupees and include shipping within India. You pay securely with Razorpay (UPI, cards, netbanking) at checkout.</p>,
        },
        {
          heading: "Handmade pieces",
          body: <p>Every piece is made by hand, so photos are a close guide rather than an exact match. Small differences in shade, size and stitch are normal.</p>,
        },
        {
          heading: "Making time & delivery",
          body: (
            <p>
              Times I give are honest estimates, not guarantees. See <Link href="/shipping">shipping</Link> for details and{" "}
              <Link href="/returns">returns</Link> for what happens if something arrives wrong.
            </p>
          ),
        },
        {
          heading: "Care & use",
          body: <p>Charms and keychains have small parts and aren&rsquo;t toys for young children. Follow the care notes on each product.</p>,
        },
        {
          heading: "My designs",
          body: <p>Photos and designs on this site are mine. Please ask before using them.</p>,
        },
      ]}
    />
  );
}
