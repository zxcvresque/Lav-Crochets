import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { PolicyPage } from "@/components/site/policy-page";

export const metadata: Metadata = pageMeta({
  title: "Returns — Lav Crochets",
  description: "Returns and refunds at Lav Crochets: handmade pieces can be returned if they arrive damaged or wrong, reported within 48 hours with photos.",
  path: "/returns",
});

export default function Page() {
  return (
    <PolicyPage
      title="Returns & refunds"
      path="/returns"
      updated="19 November 2026"
      intro="Each piece is made by hand, one at a time, so I can't take returns for a change of mind. If something arrives wrong or damaged, I'll make it right."
      sections={[
        {
          heading: "Damaged or wrong item",
          body: (
            <ul>
              <li>Message or email me <strong>within 48 hours</strong> of delivery.</li>
              <li>Include your order number and <strong>clear photos</strong> of the piece and the packaging.</li>
              <li>I&rsquo;ll offer a replacement or a refund to your original payment method.</li>
            </ul>
          ),
        },
        {
          heading: "Custom orders",
          body: <p>Custom pieces are made just for you, so they can&rsquo;t be cancelled or refunded once I&rsquo;ve started making them. Before that, you can cancel for a full refund.</p>,
        },
        {
          heading: "Handmade differences",
          body: <p>Small variations in stitch, size or shade are part of handmade work and aren&rsquo;t defects.</p>,
        },
        {
          heading: "Refund timing",
          body: <p>Approved refunds go back through Razorpay to the way you paid. Banks usually take 5 to 7 working days to show it.</p>,
        },
      ]}
    />
  );
}
