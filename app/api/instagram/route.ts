import { NextResponse } from "next/server";
import { getLatestInstagramPosts } from "@/lib/instagram";

// GET /api/instagram — latest 5 posts (cached hourly; falls back to the DB cache).
export async function GET() {
  const posts = await getLatestInstagramPosts(5);
  return NextResponse.json({ posts, live: !!process.env.INSTAGRAM_ACCESS_TOKEN });
}
