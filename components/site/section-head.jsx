"use client";
// Shared section furniture: the display-type section head and the running
// stitch divider used between home sections.
import { Reveal } from "./primitives";

// ── Section head ───────────────────────────────────────────────────────
// Headings carry the section on their own (no label above them).
export function SectionHead({ title, action = undefined, level = 2 }) {
  const H = level === 1 ? "h1" : "h2";
  return (
    <Reveal>
      <div className="section-head">
        <div>
          <H>{title}</H>
        </div>
        {action && <div className="right">{action}</div>}
      </div>
    </Reveal>
  );
}

// ── Stitch line ───────────────────────────────────────────────────────
// A running stitch drawn across the page: the one handmade motif that
// separates home sections instead of hairline rules.
export function StitchLine() {
  return (
    <div className="wrap" aria-hidden="true">
      <svg className="stitch-line" viewBox="0 0 1200 12" preserveAspectRatio="none" focusable="false">
        <path d="M0 6 H1200" />
      </svg>
    </div>
  );
}
