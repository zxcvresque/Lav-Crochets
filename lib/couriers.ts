/**
 * Courier registry. Add a courier here and it shows up in the admin order
 * page and on /track. `trackUrl` builds a link for a tracking number; when a
 * courier's site can't take the number in the URL, `deepLink` is false and the
 * customer copies the number into the courier's own form.
 */
export interface Courier {
  id: string;
  name: string;
  /** Official tracking page. */
  homeUrl: string;
  /** Build a tracking link for a number (falls back to homeUrl). */
  trackUrl: (trackingNumber: string) => string;
  /** True when trackUrl puts the number in the link itself. */
  deepLink: boolean;
  /** Secondary link (e.g. a deep link format documented elsewhere). */
  altTrackUrl?: (trackingNumber: string) => string;
  /** Rough shape of a valid number, used only as an admin hint. */
  numberPattern?: RegExp;
  numberExample?: string;
}

export const COURIERS: Courier[] = [
  {
    id: "india-post",
    name: "India Post",
    homeUrl: "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx",
    trackUrl: () => "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx",
    deepLink: false,
    // Format listed for India Post at trackingdb.com/carriers/india-post.
    altTrackUrl: (n) =>
      `https://www.indiapost.gov.in/VAS/Pages/trackingMailItem.aspx?tracking_number=${encodeURIComponent(n)}`,
    numberPattern: /^[A-Z]{2}\d{9}[A-Z]{2}$/,
    numberExample: "EE123456789IN",
  },
  {
    id: "other",
    name: "Other courier",
    homeUrl: "",
    trackUrl: () => "",
    deepLink: false,
  },
];

export function getCourier(id: string | null | undefined): Courier | undefined {
  if (!id) return undefined;
  return COURIERS.find((c) => c.id === id);
}

export function isCourierId(id: unknown): id is string {
  return typeof id === "string" && COURIERS.some((c) => c.id === id);
}

/** Public tracking links for an order, or null when there's nothing to link. */
export function trackingLinks(courierId: string | null | undefined, trackingNumber: string | null | undefined) {
  const courier = getCourier(courierId);
  if (!courier || !trackingNumber || !courier.homeUrl) return null;
  return {
    courierName: courier.name,
    primary: courier.trackUrl(trackingNumber) || courier.homeUrl,
    deepLink: courier.deepLink,
    alt: courier.altTrackUrl ? courier.altTrackUrl(trackingNumber) : null,
  };
}
