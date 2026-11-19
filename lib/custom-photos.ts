import path from "path";
import { readdir, stat, unlink } from "fs/promises";
import { UPLOAD_DIR } from "./uploads";

/**
 * Reference photos customers attach to a custom-order request.
 * Stored beside product photos, in their own folder, and only served to admins.
 */
export const CUSTOM_PHOTO_DIR = path.join(UPLOAD_DIR, "custom");
export const CUSTOM_PHOTO_URL_PREFIX = "/api/custom/photos/";
export const MAX_CUSTOM_PHOTOS = 5;
export const MAX_CUSTOM_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB each
export const ALLOWED_CUSTOM_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

/** Only names we generate: 24 hex chars + .webp or .heic */
export const SAFE_CUSTOM_PHOTO = /^[a-f0-9]{24}\.(webp|heic)$/;

export type SniffedType = "jpeg" | "png" | "webp" | "heic";

/** Identify the file from its first bytes; never trust the browser's MIME type alone. */
export function sniffImage(buf: Buffer): SniffedType | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  // ISO-BMFF: [size][ftyp][major brand]; HEIC/HEIF photos from phones.
  if (buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, 12);
    if (["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"].includes(brand)) return "heic";
  }
  return null;
}

export function customPhotoUrl(name: string) {
  return `${CUSTOM_PHOTO_URL_PREFIX}${name}`;
}

/** Parse the JSON list stored on a CustomRequest row. */
export function photoNames(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const v = JSON.parse(value);
    return Array.isArray(v) ? v.filter((n) => typeof n === "string" && SAFE_CUSTOM_PHOTO.test(n)) : [];
  } catch {
    return [];
  }
}

/**
 * Remove photos that were uploaded but never attached to a request
 * (the customer removed them or left the page). Runs opportunistically.
 */
let lastSweep = 0;
export async function sweepOrphanPhotos(isAttached: (name: string) => Promise<boolean>, maxAgeMs = 24 * 60 * 60_000) {
  const now = Date.now();
  if (now - lastSweep < 30 * 60_000) return;
  lastSweep = now;
  try {
    for (const name of await readdir(CUSTOM_PHOTO_DIR)) {
      if (!SAFE_CUSTOM_PHOTO.test(name)) continue;
      const file = path.join(CUSTOM_PHOTO_DIR, name);
      const info = await stat(file);
      if (now - info.mtimeMs > maxAgeMs && !(await isAttached(name))) await unlink(file).catch(() => {});
    }
  } catch {
    /* folder may not exist yet */
  }
}
