"use client";
import { useState } from "react";
import { Icon, Reveal } from "./primitives";
import { SectionHead } from "./section-head";

// ── FAQ (shared: home + about) ────────────────────────────────────────
// Single-open accordion. Answers stay short and answer the questions people
// actually ask before a first order. Grid-rows 0fr/1fr drives the open anim.
const FAQ_ITEMS = [
  {
    q: "How do I place an order?",
    a: "Pick your pieces from Ready to ship or Made to order, tap Add to cart, and check out. You pay online and get an email confirmation straight away.",
  },
  {
    q: "How long until it arrives?",
    a: "Ready-to-ship pieces are usually delivered in 4 to 5 days, anywhere in India. Made-to-order pieces show their making time on the product page, and for custom pieces I confirm the timing with you by email first.",
  },
  {
    q: "Do you take custom orders?",
    a: "Always, they are my favourite. Tell me what you have in mind, a plushie of your pet, a charm of a favourite character, a bouquet that never wilts, and I will plan the design, colours, timing and price with you.",
  },
  {
    q: "How do I pay?",
    a: "Securely at checkout through Razorpay: UPI, cards, net banking and wallets all work.",
  },
  {
    q: "Can I choose my own colours and sizes?",
    a: "Yes. Most pieces can be made in the colours you like, and many in different sizes too. Send a custom request and I will let you know what is possible.",
  },
  {
    q: "How do I care for a crochet piece?",
    a: "Spot clean when you can, or hand wash gently in cold water and reshape while damp. Keep it away from rough surfaces and damp, and it will last for years.",
  },
];

export function FAQ({ title = undefined, items = FAQ_ITEMS, id = "faq" }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="section tight" id={id}>
      <div className="wrap faq-wrap">
        <SectionHead
          title={title || <>Questions, <em>answered.</em></>}
        />
        <div className="faq-list">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} delay={i * 40} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button
                  className="faq-q focus-ring"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span>{it.q}</span>
                  <span className="faq-icon" aria-hidden="true"><Icon name="chev-right" size={18} /></span>
                </button>
                <div className="faq-a">
                  <div><p>{it.a}</p></div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
