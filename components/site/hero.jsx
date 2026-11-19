"use client";
import { Icon, Reveal } from "./primitives";
import { CONFIG, FadeImage } from "./data";
// Ported from the original static site (legacy-static/hero.jsx).
// hero.jsx — type-driven, motion-rich hero (pre-content-adapter version).
// Single column. Headline carries the brand. Product photography on the right.

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-copy">
        <Reveal delay={0}>
          <div className="hero-eyebrow">
            <span className="pulse" aria-hidden="true" />
            <span>Fresh in</span>
            <span className="sep">·</span>
            <span>Tulip headbands</span>
            <a href="/shop">
              See <Icon name="arrow" size={14} />
            </a>
          </div>
        </Reveal>

        <h1 className="hero-headline">
          <Reveal as="span" style={{ display: "block" }} delay={100}>
            Crochet that's
          </Reveal>
          <Reveal as="span" style={{ display: "block" }} delay={220}>
            <em>made</em> by hand
          </Reveal>
          <Reveal as="span" style={{ display: "block" }} delay={340}>
            and <span className="crayon">made for you.</span>
          </Reveal>
        </h1>

        <Reveal delay={500}>
          <p className="hero-sub">
            {CONFIG.brandName} is a tiny crochet studio in {CONFIG.city}. Cute bag charms, flower
            clips, headbands and keychains, each piece hooked by hand. Order online and pay securely with Razorpay (UPI, cards, netbanking).
          </p>
        </Reveal>

        <Reveal delay={620}>
          <div className="hero-actions">
            <a className="btn xl ink" href="/shop">
              Shop ready-to-ship
              <Icon name="arrow" size={16} />
            </a>
            <a className="btn xl ghost" href="/custom">
              Start a custom order
            </a>
          </div>
        </Reveal>

        <Reveal delay={760}>
          <div className="hero-meta">
            <span>Hooked by hand, one at a time</span>
            <span className="dot" aria-hidden="true" />
            <span>New designs on {CONFIG.instagramHandle}</span>
            <span className="dot" aria-hidden="true" />
            <span>Pay securely with Razorpay</span>
          </div>
        </Reveal>
        </div>
      {/* Real work, not decoration: a hero photo with a close-up pinned beside it. */}
      <figure className="hero-photos">
        <div className="hero-photo hero-photo--main">
          <FadeImage
            src="/catalogue-images/tulip-headband.webp"
            alt="Hand-crocheted tulip headband in soft pastel yarn"
            width={736} height={981}
            priority
            sizes="(max-width: 900px) 70vw, 34vw"
          />
        </div>
        <div className="hero-photo hero-photo--detail">
          <FadeImage
            src="/catalogue-images/daisy-headband.webp"
            alt="Close-up of a crocheted daisy headband"
            width={736} height={736}
            sizes="(max-width: 900px) 34vw, 15vw"
          />
        </div>
        <figcaption className="hero-photo-note">hooked by hand <span aria-hidden="true">·</span> love, Lav</figcaption>
      </figure>
      </div>
    </section>
  );
}

