import Link from "next/link";

/**
 * Shared reading layout for the policy pages (/privacy, /shipping, /returns,
 * /terms): one narrow column, a short intro, plain sections, and links to the
 * sibling policies at the bottom.
 */
export interface PolicySection {
  heading: string;
  body: React.ReactNode;
}

const POLICIES = [
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function PolicyPage({
  title,
  intro,
  updated,
  path,
  sections,
}: {
  title: string;
  intro: React.ReactNode;
  /** e.g. "19 November 2026" */
  updated: string;
  path: string;
  sections: PolicySection[];
}) {
  return (
    <section className="section page-top policy">
      <article className="wrap policy-wrap">
        <header className="policy-head">
          <h1>{title}</h1>
          <p className="policy-intro">{intro}</p>
          <p className="policy-updated">Last updated {updated}</p>
        </header>

        {sections.map((s) => (
          <section key={s.heading} className="policy-section">
            <h2>{s.heading}</h2>
            {s.body}
          </section>
        ))}

        <p className="policy-sign">
          Questions about any of this? Write to <a href="mailto:hello@lav-crochets.art">hello@lav-crochets.art</a> or{" "}
          <Link href="/contact">message me</Link>.
          <span className="policy-sign-name">love, Lav</span>
        </p>

        <nav className="policy-nav" aria-label="Shop policies">
          {POLICIES.map((p) => (
            <Link key={p.href} href={p.href} aria-current={p.href === path ? "page" : undefined}>
              {p.label}
            </Link>
          ))}
          <Link href="/track">Track an order</Link>
        </nav>
      </article>
    </section>
  );
}
