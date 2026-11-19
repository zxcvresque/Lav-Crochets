"use client";
import { useState, useRef } from "react";
import { Icon, Reveal } from "./primitives";
import { CONFIG } from "./data";
import { SectionHead } from "./section-head";
import { EMAIL_RE, friendlyServerError } from "./form-helpers";

// ── Contact form (on /contact) ────────────────────────────────────────
// Same accessible field pattern as the custom form: persistent labels,
// aria-invalid + aria-describedby on errors, focus moves to the first problem.
const CONTACT_REQUIRED = ["name", "email", "message"];
function validateContact(f) {
  const errs = {};
  if (!f.name.trim()) errs.name = "Add your name so I know who to reply to.";
  if (!f.email.trim()) errs.email = "Add your email, that's where I'll reply.";
  else if (!EMAIL_RE.test(f.email.trim())) errs.email = "That email doesn't look right, check for a typo.";
  if (!f.message.trim()) errs.message = "Write a few words so I know how to help.";
  return errs;
}

export function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const [errs, setErrs] = useState({});
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const formRef = useRef(null);
  const set = (k) => (e) => {
    const v = e.target.value;
    setF((cur) => ({ ...cur, [k]: v }));
    if (errs[k]) setErrs((cur) => {
      const next = validateContact({ ...f, [k]: v });
      return next[k] ? { ...cur, [k]: next[k] } : (({ [k]: _, ...rest }) => rest)(cur);
    });
  };
  const focusFirst = (found) => {
    const first = CONTACT_REQUIRED.find((k) => found[k]);
    formRef.current?.querySelector(`#ct-${first}`)?.focus();
  };
  const submit = async (e) => {
    e.preventDefault();
    const found = validateContact(f);
    setErrs(found);
    if (Object.keys(found).length) { setError(""); focusFirst(found); return; }
    setStatus("sending");
    setError("");
    let res;
    try {
      res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: f.name.trim(), email: f.email.trim(), message: f.message }),
      });
    } catch {
      setError("Couldn't send, check your connection and try again. Your message is still here.");
      setStatus("idle");
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 400 && /email/i.test(data.error || "")) {
        const fe = { email: "That email doesn't look right, check for a typo." };
        setErrs(fe); focusFirst(fe);
      }
      setError(friendlyServerError(res.status, data.error, "message", "Your message is still here."));
      setStatus("idle");
      return;
    }
    setStatus("sent");
  };
  const fieldProps = (k) => ({
    id: `ct-${k}`,
    value: f[k],
    onChange: set(k),
    "aria-required": true,
    "aria-invalid": errs[k] ? true : undefined,
    "aria-describedby": errs[k] ? `ct-${k}-err` : undefined,
  });
  const fieldErr = (k) => errs[k] ? <p id={`ct-${k}-err`} className="cfield-error">{errs[k]}</p> : null;

  return (
    <div className="contact-form-wrap">
      <h2 className="contact-form-title">Or send me a note <em>right here.</em></h2>
      {status === "sent" ? (
        <div className="cform cform-sent" role="status">
          <span className="cform-sent-ico" aria-hidden="true"><Icon name="check" size={22} stroke={2.2} /></span>
          <p className="custom-lead"><strong>Thank you, your message is on its way.</strong> I usually reply within 1 to 2 days, to {f.email.trim()}.</p>
          <p className="about-sign-name cform-sign">love, Lav</p>
        </div>
      ) : (
        <form className="cform" onSubmit={submit} noValidate ref={formRef} aria-label="Contact form">
          <p className="cform-required-note"><span aria-hidden="true">*</span> Required</p>
          <div className="cgrid">
            <div className="cfield">
              <label htmlFor="ct-name">Your name <span aria-hidden="true">*</span></label>
              <input {...fieldProps("name")} autoComplete="name" placeholder="Your name" maxLength={120} />
              {fieldErr("name")}
            </div>
            <div className="cfield">
              <label htmlFor="ct-email">Email <span aria-hidden="true">*</span></label>
              <input {...fieldProps("email")} type="email" autoComplete="email" inputMode="email" spellCheck={false} placeholder="you@example.com" maxLength={200} />
              {fieldErr("email")}
            </div>
          </div>
          <div className="cfield">
            <label htmlFor="ct-message">Message <span aria-hidden="true">*</span></label>
            <textarea {...fieldProps("message")} rows={4} maxLength={5000} placeholder="A question about an order, a collab, or just hello..." />
            {fieldErr("message")}
          </div>
          <div aria-live="assertive">
            {error && <p className="cform-error">{error}</p>}
          </div>
          <button type="submit" className="btn btn-flash cform-submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending..." : "Send message"} <Icon name="arrow" size={16} />
          </button>
        </form>
      )}
    </div>
  );
}

// ── Contact page (contact.html) ───────────────────────────────────────
export function ContactPage() {
  const methods = [
    {
      brand: true, icon: "heart", label: "Custom orders",
      value: "Tell me your idea", sub: "Colours, sizes and one-off pieces, planned together.",
      href: "/custom", cta: "Start a custom order",
    },
    {
      icon: "instagram", label: "Instagram",
      value: CONFIG.instagramHandle, sub: "New drops, restocks and behind-the-scenes.",
      href: CONFIG.instagramUrl, ext: true, cta: "Follow along",
    },
    {
      icon: "mail", label: "Email",
      value: CONFIG.supportEmail, sub: "For anything that needs a longer note.",
      href: `mailto:${CONFIG.supportEmail}`, cta: "Send an email",
    },
  ];
  return (
    <section className="section page-top" id="contact">
      <div className="wrap">
        <SectionHead
          level={1}
          title={<>Let's make something,<br/><em>or just say hi.</em></>}
        />
        <p className="custom-lead">
          For a custom piece, send a brief and I'll reply by email. For anything else, write to me
          below, find me on Instagram, or drop an email.
        </p>

        <div className="contact-grid">
          {methods.map((m, i) => (
            <Reveal key={m.label} delay={i * 80}
              as="a" href={m.href}
              {...(m.ext ? { target: "_blank", rel: "noopener" } : {})}
              className={`contact-card ${m.brand ? "brand" : ""}`}
            >
              <span className="contact-ico" aria-hidden="true"><Icon name={m.icon} size={22} /></span>
              <span className="contact-label">{m.label}</span>
              <span className="contact-value">{m.value}</span>
              <span className="contact-sub">{m.sub}</span>
              <span className="contact-go">{m.cta} <Icon name="arrow" size={15} /></span>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <ContactForm />
        </Reveal>

        <Reveal>
          <p className="contact-meta">
            <span><Icon name="globe" size={14} stroke={1.6} /> {CONFIG.city}</span>
            <span className="contact-dot" aria-hidden="true" />
            <span>I usually reply within 1 to 2 days</span>
            <span className="contact-dot" aria-hidden="true" />
            <span>Pay securely with Razorpay</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
