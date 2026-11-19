/** Browser side: send a caught render error to /api/report-error (best effort). */
export function reportClientError(error: Error & { digest?: string }, boundary: string): void {
  try {
    const body = JSON.stringify({
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      url: typeof window !== "undefined" ? window.location.pathname : undefined,
      boundary,
    });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/report-error", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/report-error", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  } catch {
    /* never let reporting throw inside an error boundary */
  }
}
