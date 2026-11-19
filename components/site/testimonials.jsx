"use client";
import { Reveal } from "./primitives";
import { liveTestimonials } from "./data";
import { SectionHead } from "./section-head";

// ── Testimonials ──────────────────────────────────────────────────────
// Driven by TESTIMONIALS in data.jsx. Renders nothing when there are none
// (placeholder entries are dropped in production). `compact` shows a single
// quote, preferring one written about `productSlug`, for the product page.
function TestimonialFigure({ t, i = 0 }) {
  return (
    <Reveal as="figure" delay={i * 90} className={`testimonial${t.placeholder ? " is-placeholder" : ""}`}>
      {t.placeholder && <span className="testimonial-flag">Placeholder, replace before launch</span>}
      <blockquote className="testimonial-quote"><p>{t.quote}</p></blockquote>
      <figcaption className="testimonial-by">
        <span className="testimonial-name">{t.name}</span>
        {t.city && <><span className="testimonial-dot" aria-hidden="true" /><span>{t.city}</span></>}
        {t.piece && (
          <>
            <span className="testimonial-dot" aria-hidden="true" />
            {t.product ? <a href={`/product/${t.product}`}>{t.piece}</a> : <span>{t.piece}</span>}
          </>
        )}
      </figcaption>
    </Reveal>
  );
}

/** @param {{ compact?: boolean, productSlug?: string }} props */
export function Testimonials({ compact = false, productSlug = undefined }) {
  const list = liveTestimonials();
  if (list.length === 0) return null;
  if (compact) {
    const t = list.find((x) => productSlug && x.product === productSlug) || list[0];
    return (
      <section className="section tight testimonials testimonials--compact" aria-label="What people say">
        <div className="wrap">
          <TestimonialFigure t={t} />
        </div>
      </section>
    );
  }
  return (
    <section className="section tight testimonials" id="kind-words">
      <div className="wrap">
        <SectionHead title={<>Kind words, <em>love returned.</em></>} />
        <div className="testimonial-grid">
          {list.slice(0, 3).map((t, i) => <TestimonialFigure key={i} t={t} i={i} />)}
        </div>
      </div>
    </section>
  );
}
