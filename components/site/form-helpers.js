// Shared by the custom-order and contact forms.
import { CONFIG } from "./data";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Server messages → friendly copy. Unknown errors fall back to a general retry line.
export function friendlyServerError(status, msg, what = "request", kept = "Your details are still here.") {
  if (status === 400 && /email/i.test(msg || "")) return "That email doesn't look right, check for a typo and try again.";
  if (status === 400) return "A required detail is missing, check the highlighted fields and try again.";
  if (status === 429) return `That's a lot of messages at once, wait a few minutes and try again. ${kept}`;
  return `Something went wrong on my side and the ${what} didn't send. Try again in a moment, or email ${CONFIG.supportEmail}. ${kept}`;
}
