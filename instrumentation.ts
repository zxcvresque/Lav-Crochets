import type { Instrumentation } from "next";

/**
 * Next.js calls onRequestError for uncaught errors in server components,
 * route handlers, server actions and middleware. They go to the same
 * lightweight reporter (structured JSON log + optional ERROR_WEBHOOK_URL).
 */
export async function register() {
  // Nothing to initialise; reporting is stateless.
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME === "edge") {
    // The reporter uses only fetch/console, but keep edge errors in the log too.
    console.error(JSON.stringify({ level: "error", message: (error as Error)?.message, path: request.path, runtime: "edge" }));
    return;
  }
  const { reportError } = await import("./lib/report-error");
  reportError(error, {
    source: "server",
    method: request.method,
    path: request.path,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
  });
};
