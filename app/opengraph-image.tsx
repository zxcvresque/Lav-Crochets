import { ImageResponse } from "next/og";
import { DEFAULT_OG_ALT } from "@/lib/site";

export const alt = DEFAULT_OG_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand colours from app/icon.svg and the paper/ink tokens in globals.css.
const PAPER = "#FBF7F0";
const PLUM = "#8E6FB3";
const LILAC = "#D9C8EF";
const INK = "#2E2545";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: PAPER,
          color: INK,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 28 28">
            <rect width="28" height="28" rx="9" fill={PLUM} />
            <path
              d="M3 16 C 7 8, 9 24, 13 16 S 19 8, 21 16 S 25 24, 27 16"
              stroke={INK}
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="14" cy="7" r="2" fill={INK} />
          </svg>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em" }}>
            <span>lav</span>
            <span style={{ color: PLUM }}>/crochets</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 92, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.035em" }}>
            <span>Handmade crochet,</span>
            <span style={{ color: PLUM }}>made with love.</span>
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#5B5070" }}>
            Bag charms, hair accessories and keychains. Delivered across India.
          </div>
        </div>

        <svg width="1040" height="28" viewBox="0 0 1040 28" style={{ display: "flex" }}>
          <path
            d="M0 14 C 20 0, 40 28, 60 14 S 100 0, 120 14 S 160 28, 180 14 S 220 0, 240 14 S 280 28, 300 14 S 340 0, 360 14 S 400 28, 420 14 S 460 0, 480 14 S 520 28, 540 14 S 580 0, 600 14 S 640 28, 660 14 S 700 0, 720 14 S 760 28, 780 14 S 820 0, 840 14 S 880 28, 900 14 S 940 0, 960 14 S 1000 28, 1020 14"
            stroke={LILAC}
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
