"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/report-client-error";

/**
 * Last-resort boundary for errors in the root layout itself. It replaces the
 * whole document, so it brings its own <html>/<body> and inline styles.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError(error, "app/global-error");
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#fbf8f3",
          color: "#231b2b",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: 24,
          textAlign: "center",
        }}
      >
        <main style={{ maxWidth: 440 }}>
          <h1 style={{ fontSize: 28, margin: "0 0 12px", letterSpacing: "-0.02em" }}>Something went wrong</h1>
          <p style={{ color: "#5a4f63", lineHeight: 1.6, margin: "0 0 24px" }}>
            Sorry, the page didn&rsquo;t load properly. Please try again; if it keeps happening, write to hello@lav-crochets.art.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => reset()}
              style={{ font: "inherit", padding: "10px 20px", borderRadius: 999, border: 0, background: "#c5a3e8", color: "#231b2b", cursor: "pointer" }}
            >
              Try again
            </button>
            <a href="/" style={{ padding: "10px 20px", borderRadius: 999, border: "1px solid #d9cfc4", color: "#231b2b", textDecoration: "none" }}>
              Go home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
