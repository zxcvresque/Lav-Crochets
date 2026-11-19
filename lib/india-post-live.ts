/**
 * OPTIONAL live India Post status for /track, via the unofficial `track-post`
 * package (pinned 1.0.0). It calls indiapost.gov.in's Next.js server actions
 * using hashes it scrapes from their JS bundles, so it WILL break whenever
 * India Post redeploys. Treat every result as a nice-to-have:
 *
 *  - off unless INDIA_POST_LIVE_TRACKING=1
 *  - server-side only, hard 5s timeout, never throws
 *  - results (including "nothing found") cached ~30 min per number
 *  - on any failure the caller just shows the admin-entered status + ETA
 */

export interface LiveEvent {
  date: string;
  office: string;
  description: string;
  status: string;
}

export interface LiveStatus {
  status: string;
  delivered: boolean;
  deliveryDate: string | null;
  events: LiveEvent[];
  fetchedAt: string;
}

const TIMEOUT_MS = 5000;
const TTL_MS = 30 * 60 * 1000;
const MAX_EVENTS = 12;
const cache = new Map<string, { at: number; value: LiveStatus | null }>();
const inflight = new Map<string, Promise<LiveStatus | null>>();

export function liveTrackingEnabled(): boolean {
  return process.env.INDIA_POST_LIVE_TRACKING === "1";
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      () => { clearTimeout(t); resolve(null); },
    );
  });
}

async function fetchLive(trackingNumber: string): Promise<LiveStatus | null> {
  try {
    // Loaded lazily so the package is never touched when the flag is off.
    const mod = (await import("track-post")) as unknown as {
      track: (id: string, opts?: { force?: boolean; verbose?: boolean }) => Promise<{
        status: string; delivered: boolean; delivery_date: string | null; source: string;
        events: LiveEvent[]; fetched_at: string;
      }>;
    };
    const r = await mod.track(trackingNumber);
    // Never surface the package's demo data as if it were real.
    if (!r || r.source !== "LIVE_INDIAPOST_GOV" || !Array.isArray(r.events)) return null;
    return {
      status: String(r.status || ""),
      delivered: Boolean(r.delivered),
      deliveryDate: r.delivery_date ?? null,
      events: r.events.slice(0, MAX_EVENTS).map((e) => ({
        date: String(e.date || ""),
        office: String(e.office || ""),
        description: String(e.description || ""),
        status: String(e.status || ""),
      })),
      fetchedAt: r.fetched_at || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/** Live India Post status, or null (disabled, timed out, broken, or not found). */
export async function getIndiaPostLiveStatus(trackingNumber: string): Promise<LiveStatus | null> {
  if (!liveTrackingEnabled()) return null;
  const id = trackingNumber.trim().toUpperCase();
  if (!/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(id)) return null;

  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;

  // One upstream call per number at a time; the slow call keeps running in the
  // background after our timeout and still fills the cache for the next visit.
  let p = inflight.get(id);
  if (!p) {
    p = fetchLive(id).then((value) => {
      cache.set(id, { at: Date.now(), value });
      if (cache.size > 2000) cache.delete(cache.keys().next().value as string);
      inflight.delete(id);
      return value;
    });
    inflight.set(id, p);
  }
  return withTimeout(p, TIMEOUT_MS);
}
