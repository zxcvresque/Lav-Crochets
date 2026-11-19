import { NextRequest, NextResponse } from "next/server";
import { access } from "fs/promises";
import path from "path";
import { Resend } from "resend";
import { escapeHtml } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { absoluteUrl } from "@/lib/site";
import { CUSTOM_PHOTO_DIR, MAX_CUSTOM_PHOTOS, SAFE_CUSTOM_PHOTO } from "@/lib/custom-photos";

interface CustomRequestBody {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  whatYouWant?: unknown;
  colors?: unknown;
  budget?: unknown;
  notes?: unknown;
  photos?: unknown;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, "custom-request", 5, 10 * 60_000);
  if (limited) return limited;

  let body: CustomRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = text(body.name, 120);
  const email = text(body.email, 200);
  const whatYouWant = text(body.whatYouWant, 4000);
  const phone = text(body.phone, 40);
  const colors = text(body.colors, 400);
  const budget = text(body.budget, 120);
  const notes = text(body.notes, 4000);

  if (!name || !email || !whatYouWant) {
    return NextResponse.json({ error: "Name, email, and request details are required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Reference photos: names returned by POST /api/custom/photos, at most 5,
  // each one we generated and that exists on disk.
  const rawPhotos = Array.isArray(body.photos) ? body.photos : [];
  if (rawPhotos.length > MAX_CUSTOM_PHOTOS) {
    return NextResponse.json({ error: `You can attach up to ${MAX_CUSTOM_PHOTOS} photos.` }, { status: 400 });
  }
  const photos = [...new Set(rawPhotos.filter((n): n is string => typeof n === "string" && SAFE_CUSTOM_PHOTO.test(n)))];
  if (photos.length !== rawPhotos.length) {
    return NextResponse.json({ error: "One of the photos didn't upload properly. Remove it and try again." }, { status: 400 });
  }
  for (const n of photos) {
    try {
      await access(path.join(CUSTOM_PHOTO_DIR, n));
    } catch {
      return NextResponse.json({ error: "One of the photos didn't upload properly. Remove it and try again." }, { status: 400 });
    }
  }

  try {
    const saved = await prisma.customRequest.create({
      data: {
        name,
        email,
        phone: phone || null,
        whatYouWant,
        colors: colors || null,
        budget: budget || null,
        notes: notes || null,
        photos: photos.length ? JSON.stringify(photos) : null,
      },
    });

    if (!process.env.RESEND_API_KEY) {
      // Dev fallback: the request is saved (see /admin/custom); no email sent.
      console.log("Custom order request saved (no RESEND_API_KEY):", saved.id, `${photos.length} photo(s)`);
      return NextResponse.json({ success: true });
    }

    // The request is already saved, so an email hiccup shouldn't make the
    // customer resend it (that would create a duplicate).
    try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const adminLink = absoluteUrl("/admin/custom");

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Lav Crochets <hello@lav-crochets.art>",
      to: "hello@lav-crochets.art",
      replyTo: email,
      subject: `Custom order request from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 22px; font-weight: 600; margin-bottom: 24px;">New custom order request</h1>

          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888; font-size: 13px; width: 120px;">Name</td><td style="padding: 8px 0; font-weight: 500;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">Email</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}" style="color: #1A1523;">${escapeHtml(email)}</a></td></tr>
            ${phone ? `<tr><td style="padding: 8px 0; color: #888; font-size: 13px;">Phone</td><td style="padding: 8px 0;">${escapeHtml(phone)}</td></tr>` : ""}
            <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">What</td><td style="padding: 8px 0; font-weight: 500;">${escapeHtml(whatYouWant)}</td></tr>
            ${colors ? `<tr><td style="padding: 8px 0; color: #888; font-size: 13px;">Colours</td><td style="padding: 8px 0;">${escapeHtml(colors)}</td></tr>` : ""}
            ${budget ? `<tr><td style="padding: 8px 0; color: #888; font-size: 13px;">Budget</td><td style="padding: 8px 0;">${escapeHtml(budget)}</td></tr>` : ""}
            <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">Photos</td><td style="padding: 8px 0;">${photos.length ? `${photos.length} reference photo${photos.length === 1 ? "" : "s"}, <a href="${adminLink}" style="color: #1A1523;">view in the studio</a>` : "None"}</td></tr>
          </table>

          ${notes ? `
          <div style="margin-top: 24px; padding: 16px; background: #F5F4F0; border-radius: 8px;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Notes</p>
            <p style="margin: 0; line-height: 1.6; color: #444;">${escapeHtml(notes).replace(/\n/g, "<br />")}</p>
          </div>
          ` : ""}
        </div>
      `,
    });

    // Confirmation to the customer.
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Lav Crochets <hello@lav-crochets.art>",
      to: email,
      subject: "I got your custom order request!",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 22px; font-weight: 600; margin-bottom: 16px;">Hi ${escapeHtml(name)}!</h1>
          <p style="font-size: 16px; color: #444; margin-bottom: 24px; line-height: 1.6;">
            Thank you for your custom order request! I will get back to you within 1 to 2 days to confirm the design, the making time and the price.
          </p>
          <p style="font-size: 14px; color: #888;">
            In the meantime, feel free to browse the shop or follow along on Instagram.
          </p>
          <p style="font-size: 14px; color: #444;">love, Lav</p>
        </div>
      `,
    });
    } catch (mailError) {
      console.error("Custom order request saved but email failed:", saved.id, mailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Custom order request error:", error);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
