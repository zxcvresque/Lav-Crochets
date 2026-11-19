import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import {
  CUSTOM_PHOTO_DIR,
  MAX_CUSTOM_PHOTO_BYTES,
  ALLOWED_CUSTOM_PHOTO_TYPES,
  sniffImage,
  sweepOrphanPhotos,
} from "@/lib/custom-photos";

// POST /api/custom/photos — one reference photo for a custom-order request
// (multipart "file"). Public, so it is rate-limited and checks size, declared
// type and the file's real signature. JPG/PNG/WebP are re-encoded to WebP
// (max 1600px), which also strips metadata like GPS location. HEIC is kept as
// sent when this server can't decode it. Returns { name } for the request.
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, "custom-photo", 20, 10 * 60_000);
  if (limited) return limited;

  const len = Number(request.headers.get("content-length") || 0);
  if (len > MAX_CUSTOM_PHOTO_BYTES + 64 * 1024) {
    return NextResponse.json({ error: "Photos must be 5 MB or smaller." }, { status: 413 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a photo to upload." }, { status: 400 });
  if (file.size > MAX_CUSTOM_PHOTO_BYTES) {
    return NextResponse.json({ error: "Photos must be 5 MB or smaller." }, { status: 413 });
  }
  const declared = (file.type || "").toLowerCase();
  const byName = /\.(heic|heif)$/i.test(file.name);
  if (declared && !ALLOWED_CUSTOM_PHOTO_TYPES.includes(declared) && !byName) {
    return NextResponse.json({ error: "Use a JPG, PNG, WebP or HEIC photo." }, { status: 415 });
  }

  const input = Buffer.from(await file.arrayBuffer());
  const kind = sniffImage(input);
  if (!kind) return NextResponse.json({ error: "That file isn't a JPG, PNG, WebP or HEIC photo." }, { status: 415 });

  const id = crypto.randomBytes(12).toString("hex");
  let name = `${id}.webp`;
  let output: Buffer;
  try {
    output = await sharp(input, { limitInputPixels: 50_000_000 })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch (e) {
    if (kind !== "heic") {
      console.error("Custom photo decode failed:", e);
      return NextResponse.json({ error: "Couldn't read that photo. Try a JPG, PNG or WebP." }, { status: 415 });
    }
    // HEVC-coded HEIC can't be decoded by this sharp build: keep the original.
    name = `${id}.heic`;
    output = input;
  }

  await mkdir(CUSTOM_PHOTO_DIR, { recursive: true });
  await writeFile(path.join(CUSTOM_PHOTO_DIR, name), output);

  // Opportunistic cleanup of photos that were never attached to a request.
  void sweepOrphanPhotos(async (n) => (await prisma.customRequest.count({ where: { photos: { contains: n } } })) > 0);

  return NextResponse.json({ name }, { status: 201 });
}
