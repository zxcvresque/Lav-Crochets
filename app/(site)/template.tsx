"use client";
// Client-side route changes (next/link, router.push) fade the new page's
// content in; the shell (header, footer, cart) lives in the layout and stays
// put. The first render after a full page load never animates, so server HTML
// is shown as-is (full loads get the CSS cross-document view transition).
import { useEffect, useState } from "react";

let hasMounted = false;

export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  const [animate] = useState(() => typeof window !== "undefined" && hasMounted);
  useEffect(() => { hasMounted = true; }, []);
  return <div className={animate ? "route-in" : undefined}>{children}</div>;
}
