"use client";
import { useEffect, useRef } from "react";
import { Icon, Reveal } from "./primitives";
import { CONFIG } from "./data";
import { SectionHead } from "./section-head";
import { FAQ } from "./faq";

// ── About page (about.html) ───────────────────────────────────────────
export function AboutPage() {
  const promises = [
    "Every piece is hooked by hand, one at a time.",
    "Your colours and sizes are always welcome.",
    "Made in small batches, so no two are identical.",
    "Order online, pay securely with Razorpay, delivered in 4 to 5 days.",
  ];
  // Staggered checklist entrance: items stay visible by default and only
  // animate in once the panel scrolls into view (skipped for reduced motion).
  const promiseRef = useRef(null);
  useEffect(() => {
    const el = promiseRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.dataset.anim = "in"; io.disconnect(); } },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <>
      <section className="section page-top" id="about">
        <div className="wrap">
          <SectionHead
            level={1}
            title={<>Hi, I'm Janhavi.<br/><em>Most people call me Lav.</em></>}
          />
          <div className="grid-2 about-grid">
            <Reveal>
              <div className="about-story">
                <p className="about-lead">
                  {CONFIG.brandName} started with one ball of cotton yarn, a borrowed hook, and a
                  YouTube video I kept pausing and rewinding until my fingers finally caught on.
                </p>
                <p>
                  I was after something to do with my hands, something slow in a world that moves a
                  little too fast. The first thing I ever finished was a lopsided little flower. It
                  was far from perfect, but I had made it from a single thread, and I was hooked, in
                  every sense.
                </p>
                <p>
                  "Lav" is the name my closest people call me. It is also the word stitched into
                  everything I make. Every charm, clip and keychain leaves my hands made with love,
                  never rushed and never mass-produced, so no two are ever exactly alike. I think
                  that is the best part.
                </p>
                <p>
                  Today, from my little studio in {CONFIG.city}, I crochet bag charms, hair
                  accessories and keychains, plus all the custom pieces people dream up. You bring
                  the colours and the idea; I hook it, one stitch at a time.
                </p>
                <p className="about-sign">Thank you for letting a small handmade thing into your day.</p>
                <p className="about-sign-name">love, Lav</p>
              </div>
            </Reveal>

            <Reveal delay={150} className="about-promise-col">
              <div className="panel brand about-promise" ref={promiseRef}>
                <h3 className="panel-title about-promise-title">What I promise</h3>
                <ul className="promise-list">
                  {promises.map((t, i) => (
                    <li key={i} style={{ "--i": i }}>
                      <span className="promise-check" aria-hidden="true"><Icon name="check" size={14} stroke={2.4} /></span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <a href="/custom" className="btn ink btn-flash about-promise-cta">
                  Start a custom order <Icon name="arrow" size={16} />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <FAQ />

      <section className="section tight">
        <div className="wrap">
          <div className="panel ink about-cta">
            <h2>Ready to find your <span className="about-cta-em">new favourite thing?</span></h2>
            <div className="about-cta-actions">
              <a className="btn xl btn-flash" href="/shop">Shop the studio <Icon name="arrow" size={16} /></a>
              <a className="btn xl outline btn-flash" href="/contact">
                Get in touch
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
