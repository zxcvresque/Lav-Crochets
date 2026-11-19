import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site/site-shell";
import { Icon } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Page not found — Lav Crochets",
  robots: { index: false },
};

// Root 404: covers unknown URLs and notFound() from any page. It sits outside the
// (site) route group, so it brings the site shell (header, footer, cart) itself.
export default function NotFound() {
  return (
    <SiteShell>
      <section className="section page-top">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h1>
                This one slipped off the hook.
                <br />
                <em>Let me help you find your way.</em>
              </h1>
            </div>
          </div>
          <div className="about-story">
            <p className="about-lead">
              I looked everywhere, but this page is not here. It may have sold out, moved, or the
              link lost a stitch along the way.
            </p>
            <p>
              Everything I make lives in the shop. If you want something here today, the
              ready-to-ship pieces are the place to look. And if you had something particular in
              mind, tell me about it and I will hook it for you.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
              <Link href="/shop" className="btn lg">
                Browse the shop <Icon name="arrow" size={16} />
              </Link>
              <Link href="/ready-to-ship" className="btn lg ghost">
                Ready to ship
              </Link>
              <Link href="/custom" className="btn lg ghost">
                Start a custom order
              </Link>
            </div>
            <div style={{ marginTop: 40 }}>
              <p className="about-sign-name">love, Lav</p>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
