import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/ThemeScript";
import { SITE_URL, SITE_NAME } from "@/lib/site";

// Self-hosted via next/font: no render-blocking Google Fonts request.
// The CSS variables feed the --font-* tokens in globals.css.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-bricolage",
});
const geist = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], display: "swap", variable: "--font-geist-mono" });

const DESCRIPTION =
  "Handmade crochet charms, hair accessories and keychains. Order online, pay securely with Razorpay, delivered in 4 to 5 days.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Lav Crochets — Handmade crochet, made with love.",
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    title: "Lav Crochets — Handmade crochet, made with love.",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Lav Crochets — Handmade crochet, made with love.",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#8E6FB3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${bricolage.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
