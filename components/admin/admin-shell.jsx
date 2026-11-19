"use client";
// Admin chrome built from the storefront's own pieces: the same floating pill
// header (it docks into a pill on scroll), the same mobile drawer, icons, brand
// mark and theme toggle, so the studio side feels like the shop.
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icon, BrandMark, useScrolled } from "@/components/site/primitives";
import { CONFIG } from "@/components/site/data";
import { signOut } from "@/lib/auth-client";

export const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/custom", label: "Custom requests" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/customers", label: "Customers" },
];

function isCurrent(pathname, href) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");
}

export function AdminShell({ userName, children }) {
  const pathname = usePathname() || "/admin";
  const router = useRouter();
  const scrolled = useScrolled(40);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(null);

  useEffect(() => { setDark(document.documentElement.getAttribute("data-theme") === "dark"); }, []);
  useEffect(() => {
    if (dark === null) return;
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try { localStorage.setItem("lav.theme", dark ? "dark" : "light"); } catch (e) { /* no-op */ }
  }, [dark]);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const doSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="app admin-app">
      <div className={`header-wrap ${scrolled ? "scrolled" : ""}`}>
        <div className="header">
          <button className="iconbtn hamburger focus-ring" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
            <Icon name="menu" size={20} />
          </button>

          <a href="/admin" className="brand" aria-label={`${CONFIG.brandName} studio`}>
            <BrandMark size={26} />
            <span style={{ display: "inline-flex", alignItems: "baseline" }}>
              <span>{CONFIG.wordmarkA}</span><span className="name-d">/studio</span>
            </span>
          </a>

          <nav aria-label="Admin">
            {ADMIN_NAV.map((n) => (
              <a key={n.href} href={n.href} aria-current={isCurrent(pathname, n.href) ? "page" : undefined}>{n.label}</a>
            ))}
          </nav>

          <div className="header-actions">
            <button className="iconbtn header-extra" onClick={() => setDark((d) => !d)} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
              <Icon name={dark ? "sun" : "moon"} size={18} />
            </button>
            <a className="iconbtn header-extra" href="/" aria-label="View the shop" title="View the shop">
              <Icon name="arrow-up-right" size={18} />
            </a>
            <button className="iconbtn header-extra" onClick={doSignOut} aria-label="Sign out" title="Sign out">
              <Icon name="user" size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className={`scrim ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} aria-hidden="true" />
      <aside className={`mobile-nav-drawer ${menuOpen ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Admin navigation">
        <div className="mobile-nav-head">
          <a href="/admin" className="brand"><BrandMark size={26} /><span><span>{CONFIG.wordmarkA}</span><span className="name-d">/studio</span></span></a>
          <button className="iconbtn focus-ring" onClick={() => setMenuOpen(false)} aria-label="Close menu"><Icon name="x" size={20} /></button>
        </div>
        <nav className="mobile-nav-list" aria-label="Admin">
          {ADMIN_NAV.map((n) => (
            <a key={n.href} href={n.href} aria-current={isCurrent(pathname, n.href) ? "page" : undefined}>{n.label}</a>
          ))}
          <hr className="mobile-nav-rule" aria-hidden="true" />
          <a className="mobile-nav-sub" href="/"><span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}><Icon name="arrow-up-right" size={18} /><span>View the shop</span></span></a>
          <button className="mobile-nav-sub" onClick={() => setDark((d) => !d)}><span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}><Icon name={dark ? "sun" : "moon"} size={18} /><span>{dark ? "Light mode" : "Dark mode"}</span></span></button>
          <button className="mobile-nav-sub" onClick={doSignOut}><span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}><Icon name="user" size={18} /><span>Sign out</span></span></button>
        </nav>
        {userName && <div className="mobile-nav-foot"><p className="mobile-nav-meta">Signed in as {userName}</p></div>}
      </aside>

      <main className="admin-main wrap">{children}</main>
    </div>
  );
}
