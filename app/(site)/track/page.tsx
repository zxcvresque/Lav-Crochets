import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import TrackClient from "./track-client";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Track your order — Lav Crochets",
    description: "Check where your Lav Crochets order is: confirmed, being made, shipped or delivered, plus the courier tracking number and expected delivery date.",
    path: "/track",
  }),
  // Lookup results are personal; keep the page itself out of search results.
  robots: { index: false, follow: true },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const initialOrder = typeof order === "string" ? order.slice(0, 40) : "";
  return <TrackClient initialOrder={initialOrder} />;
}
