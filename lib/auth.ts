import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins/magic-link";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";
import { prisma } from "./prisma";

const isBuild = process.env.NEXT_PHASE === "phase-production-build";

// A real secret is required at runtime. During `next build` a placeholder is
// allowed so the build doesn't crash; the server refuses to start without one.
const SECRET = process.env.BETTER_AUTH_SECRET;
if (!SECRET && process.env.NODE_ENV === "production" && !isBuild) {
  throw new Error("BETTER_AUTH_SECRET must be set in production");
}

const BASE_URL =
  process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/** Emails that automatically get the admin role when their account is created. */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "hello@lav-crochets.art")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  secret: SECRET || "build-time-placeholder-secret-not-used-at-runtime",
  baseURL: BASE_URL,
  trustedOrigins: [BASE_URL],
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "customer", input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            role: ADMIN_EMAILS.includes(user.email.toLowerCase()) ? "admin" : "customer",
          },
        }),
      },
    },
  },
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  socialProviders: googleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : {},
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        if (!process.env.RESEND_API_KEY) {
          // Dev fallback so magic links are testable without Resend.
          console.warn(`[auth] RESEND_API_KEY not set. Magic link for ${email}: ${url}`);
          return;
        }
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "Lav Crochets <hello@lav-crochets.art>",
          to: email,
          subject: "Sign in to Lav Crochets",
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 24px;">Sign in to Lav Crochets</h1>
              <p style="font-size: 16px; color: #444; margin-bottom: 24px;">Click the button below to sign in. This link expires in 5 minutes.</p>
              <a href="${url}" style="display: inline-block; background: #1A1523; color: #FAF7F2; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 16px;">Sign in</a>
              <p style="font-size: 13px; color: #888; margin-top: 24px;">If you didn't request this email, you can safely ignore it.</p>
            </div>`,
        });
      },
    }),
    nextCookies(),
  ],
});

export type SessionUser = { id: string; email: string; name?: string | null; role?: string | null };

/** Returns the session user, or null. Pass request headers (API routes) or next/headers (server components). */
export async function getSessionUser(headers: Headers): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers });
  return (session?.user as SessionUser | undefined) ?? null;
}

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === "admin";
}
