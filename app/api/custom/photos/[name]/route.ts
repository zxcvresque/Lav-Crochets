import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/api";
import { CUSTOM_PHOTO_DIR, SAFE_CUSTOM_PHOTO } from "@/lib/custom-photos";

// GET /api/custom/photos/:name — admin only: customers' reference photos are private.
export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const { name } = await params;
  if (!SAFE_CUSTOM_PHOTO.test(name)) return new NextResponse("Not found", { status: 404 });
  try {
    const data = await readFile(path.join(CUSTOM_PHOTO_DIR, name));
    const heic = name.endsWith(".heic");
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": heic ? "image/heic" : "image/webp",
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
        ...(heic && { "Content-Disposition": `inline; filename="${name}"` }),
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
