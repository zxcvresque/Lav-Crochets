import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { PolicyPage } from "@/components/site/policy-page";

export const metadata: Metadata = pageMeta({
  title: "Privacy — Lav Crochets",
  description: "What Lav Crochets collects when you order or get in touch, why, and who it's shared with. Payments are handled by Razorpay.",
  path: "/privacy",
});

export default function Page() {
  return (
    <PolicyPage
      title="Privacy"
      path="/privacy"
      updated="19 November 2026"
      intro="I only collect what I need to make and send your order, and I never sell it."
      sections={[
        {
          heading: "What I collect",
          body: (
            <ul>
              <li>Your name, email, phone and delivery address when you order.</li>
              <li>What you ordered and any custom request or message you send me.</li>
              <li>Your email if you create an account or sign in.</li>
            </ul>
          ),
        },
        {
          heading: "Payments",
          body: <p>Payments are handled by Razorpay. Your card, UPI or bank details go straight to them; I never see or store them.</p>,
        },
        {
          heading: "Who it's shared with",
          body: (
            <p>
              Only the services that help me run the shop: Razorpay for payments, the courier for delivery (name, phone and address),
              and my email provider to send order updates. Nobody else.
            </p>
          ),
        },
        {
          heading: "Cookies",
          body: <p>The site uses a few essential cookies and local storage to keep you signed in, remember your cart and your light or dark theme. No advertising trackers.</p>,
        },
        {
          heading: "Your choices",
          body: <p>You can ask me to see, correct or delete your details at any time. I keep order records as long as the law requires for accounts and tax.</p>,
        },
      ]}
    />
  );
}
