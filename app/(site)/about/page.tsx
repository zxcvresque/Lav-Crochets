import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { AboutPage } from "@/components/site/about-page";

export const metadata: Metadata = pageMeta({
  title: "About — Lav Crochets",
  description: "The story behind Lav Crochets, a tiny handmade crochet studio by Janhavi (Lav) in Chhatrapati Sambhajinagar. Every piece is hooked by hand. Plus answers to common questions.",
  path: "/about",
});

export default function Page() {
  return <AboutPage />;
}
