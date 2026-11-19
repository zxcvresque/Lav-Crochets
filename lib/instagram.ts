import { prisma } from "./prisma";

/**
 * Latest posts from @crochetsbylav via the Instagram API (Instagram Login).
 *
 * Needs INSTAGRAM_ACCESS_TOKEN (a long-lived token for the shop's professional
 * account). Results are cached by Next for an hour and mirrored into the
 * InstagramPost table, so the site keeps showing the last good posts if the API
 * is down or the token lapses. Without a token, the cached posts (if any) show.
 */

export interface InstagramTile {
  id: string;
  img: string;
  url: string;
  caption?: string;
  kind: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
}

interface ApiPost {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

const FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";

async function fromCache(limit: number): Promise<InstagramTile[]> {
  try {
    const rows = await prisma.instagramPost.findMany({ orderBy: { timestamp: "desc" }, take: limit });
    return rows.map((r) => ({
      id: r.instagramId,
      img: r.mediaUrl,
      url: r.permalink,
      caption: r.caption ?? undefined,
      kind: (r.mediaType as InstagramTile["kind"]) || "IMAGE",
    }));
  } catch {
    return [];
  }
}

export async function getLatestInstagramPosts(limit = 5): Promise<InstagramTile[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return fromCache(limit);

  try {
    const url = `https://graph.instagram.com/me/media?fields=${FIELDS}&limit=${limit}&access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url, { next: { revalidate: 3600, tags: ["instagram"] } });
    if (!res.ok) throw new Error(`Instagram API ${res.status}`);
    const posts: ApiPost[] = (await res.json()).data ?? [];

    const tiles = posts
      .map((p) => ({
        id: p.id,
        // Videos (reels) have a thumbnail; images and carousels have media_url.
        img: (p.media_type === "VIDEO" ? p.thumbnail_url : p.media_url) || p.media_url || "",
        url: p.permalink,
        caption: p.caption,
        kind: p.media_type,
        timestamp: p.timestamp,
      }))
      .filter((t) => t.img);

    // Mirror into the DB as a fallback (best effort).
    await Promise.all(
      tiles.map((t) =>
        prisma.instagramPost
          .upsert({
            where: { instagramId: t.id },
            update: { mediaUrl: t.img, permalink: t.url, caption: t.caption ?? null, mediaType: t.kind, timestamp: new Date(t.timestamp), cachedAt: new Date() },
            create: { instagramId: t.id, mediaUrl: t.img, permalink: t.url, caption: t.caption ?? null, mediaType: t.kind, timestamp: new Date(t.timestamp) },
          })
          .catch(() => null)
      )
    );

    return tiles.slice(0, limit).map(({ timestamp: _t, ...tile }) => tile);
  } catch (e) {
    console.error("[instagram] falling back to cached posts:", e);
    return fromCache(limit);
  }
}
