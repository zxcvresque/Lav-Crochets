import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { ContactPage } from "@/components/site/contact-page";

export const metadata: Metadata = pageMeta({
  title: "Contact — Lav Crochets",
  description: "Get in touch with Lav Crochets. Send a custom brief, follow on Instagram, or send an email. Order online, pay securely with Razorpay, delivered in 4 to 5 days.",
  path: "/contact",
});

export default function Page() {
  return <ContactPage />;
}
