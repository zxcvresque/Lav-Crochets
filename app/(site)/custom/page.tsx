import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { CustomPage } from "@/components/site/custom-page";

export const metadata: Metadata = pageMeta({
  title: "Custom orders — Lav Crochets",
  description: "Request a custom handmade crochet piece. Send the brief and I confirm the design, making time and price by email; pay securely with Razorpay.",
  path: "/custom",
});

export default function Page() {
  return <CustomPage />;
}
