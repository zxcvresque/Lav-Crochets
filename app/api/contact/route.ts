import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { escapeHtml } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

interface ContactBody {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: NextRequest) {
  // 5 messages per 10 minutes per visitor.
  const limited = rateLimit(request, "contact", 5, 10 * 60_000);
  if (limited) return limited;
  try {
    const raw: ContactBody = await request.json();
    const body = {
      name: text(raw?.name, 120),
      email: text(raw?.email, 200),
      subject: text(raw?.subject, 200),
      message: text(raw?.message, 5000),
    };

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.log("Contact form (no RESEND_API_KEY) from:", body.email);
      return NextResponse.json({ success: true });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Lav Crochets <hello@lav-crochets.art>",
      to: "hello@lav-crochets.art",
      replyTo: body.email,
      subject: body.subject ? `[Contact] ${body.subject}` : `New message from ${body.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 20px; font-weight: 600; margin-bottom: 24px;">New contact form message</h1>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888; font-size: 13px; width: 100px;">Name</td><td style="padding: 8px 0; font-weight: 500;">${escapeHtml(body.name)}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">Email</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(body.email)}" style="color: #1A1523;">${escapeHtml(body.email)}</a></td></tr>
            ${body.subject ? `<tr><td style="padding: 8px 0; color: #888; font-size: 13px;">Subject</td><td style="padding: 8px 0;">${escapeHtml(body.subject)}</td></tr>` : ""}
          </table>
          <div style="margin-top: 24px; padding: 16px; background: #F5F4F0; border-radius: 8px;">
            <p style="margin: 0; line-height: 1.7; color: #444;">${escapeHtml(body.message).replace(/\n/g, "<br />")}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
