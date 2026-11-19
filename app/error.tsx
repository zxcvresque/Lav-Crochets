"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/report-client-error";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error, "app/error");
  }, [error]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      gap: 24,
      textAlign: "center",
      padding: "0 24px",
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: "var(--r-pill)",
        background: "color-mix(in oklch, var(--bad) 12%, transparent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bad)" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--step-8)", fontWeight: 600, margin: "0 0 8px" }}>
          Something went wrong
        </h1>
        <p style={{ color: "var(--fg-muted)", maxWidth: "40ch", margin: "0 auto" }}>
          We ran into an unexpected error. Please try again or refresh the page.
        </p>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          className="btn"
          onClick={() => reset()}
        >
          Try again
        </button>
        <a href="/" className="btn ghost">
          Go home
        </a>
      </div>
    </div>
  );
}
