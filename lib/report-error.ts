/**
 * Lightweight error reporting. Logs one structured JSON line per error, and
 * when ERROR_WEBHOOK_URL is set, POSTs the same payload there (Slack/Discord
 * incoming webhook, a log collector, anything that accepts JSON). No SDK.
 *
 * Safe to import from server code, route handlers and instrumentation.
 */
export type ErrorContext = Record<string, unknown>;

export interface ErrorReport {
  level: "error";
  time: string;
  message: string;
  name?: string;
  stack?: string;
  digest?: string;
  env?: string;
  context?: ErrorContext;
}

const MAX_STACK = 4000;

export function buildErrorReport(error: unknown, context?: ErrorContext): ErrorReport {
  const e = error instanceof Error ? error : new Error(typeof error === "string" ? error : JSON.stringify(error));
  return {
    level: "error",
    time: new Date().toISOString(),
    message: e.message,
    name: e.name,
    stack: e.stack?.slice(0, MAX_STACK),
    digest: (e as Error & { digest?: string }).digest,
    env: process.env.NODE_ENV,
    context,
  };
}

/** Fire-and-forget: never throws, never blocks the caller for long. */
export function reportError(error: unknown, context?: ErrorContext): void {
  const report = buildErrorReport(error, context);
  try {
    console.error(JSON.stringify(report));
  } catch {
    console.error("[report-error]", report.message);
  }

  const url = process.env.ERROR_WEBHOOK_URL;
  if (!url) return;
  const body = JSON.stringify({
    // `text` makes Slack/Discord-style webhooks render something readable.
    text: `[lav-crochets] ${report.name ?? "Error"}: ${report.message}`,
    ...report,
  });
  try {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: AbortSignal.timeout(3000),
    }).catch(() => {});
  } catch {
    // Reporting must never take the request down with it.
  }
}
