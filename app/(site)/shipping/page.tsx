import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/site";
import { PolicyPage } from "@/components/site/policy-page";

export const metadata: Metadata = pageMeta({
  title: "Shipping — Lav Crochets",
  description: "How Lav Crochets ships: by courier across India, about 4 to 5 days for ready-to-ship pieces, made-to-order timing confirmed by email, with tracking or an expected date.",
  path: "/shipping",
});

export default function Page() {
  return (
    <PolicyPage
      title="Shipping"
      path="/shipping"
      updated="19 November 2026"
      intro="Every piece is packed by me and sent by courier. Shipping is included in the price you see."
      sections={[
        {
          heading: "How long it takes",
          body: (
            <ul>
              <li><strong>Ready to ship:</strong> delivered in about 4 to 5 days from your order.</li>
              <li><strong>Made to order:</strong> I hook it after you order. I&rsquo;ll email you the making time, then it ships and arrives in about 4 to 5 days.</li>
              <li><strong>Custom pieces:</strong> timing is agreed with you by email before I start.</li>
            </ul>
          ),
        },
        {
          heading: "Tracking",
          body: (
            <p>
              When your order ships I&rsquo;ll email you the courier and, if the courier gives one, a tracking number. If there&rsquo;s no
              tracking number, you&rsquo;ll get an expected delivery date instead. You can check any time on the{" "}
              <Link href="/track">track your order</Link> page with your order number and email or phone.
            </p>
          ),
        },
        {
          heading: "Where I ship",
          body: <p>Anywhere in India the courier delivers. Please double-check your address and pincode at checkout; I can&rsquo;t redirect a parcel once it&rsquo;s sent.</p>,
        },
        {
          heading: "Delays",
          body: <p>Couriers sometimes run late, especially around festivals. If your piece is taking longer than the date I gave you, message me and I&rsquo;ll chase it up.</p>,
        },
      ]}
    />
  );
}
