"use client";
// use-dialog.js — Shared behaviour for the site's modal drawers (cart, mobile nav).
// While `open`:
//   • focus moves into the dialog (initialFocusRef, else first tabbable),
//   • Tab / Shift+Tab cycle inside it, Escape calls onClose,
//   • everything outside it is made `inert` (scrim and keepRefs excepted),
//   • page scroll is locked without layout shift (scrollbar width compensated).
// On close, focus returns to whatever opened it (or `fallbackFocus`, a selector).
// The dialog element itself should carry `inert={!open}` so it is never
// tabbable while hidden off-screen.
import { useEffect, useRef } from "react";

const TABBABLE = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "[contenteditable]:not([contenteditable=false])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function getTabbables(root) {
  if (!root) return [];
  return Array.from(root.querySelectorAll(TABBABLE)).filter(
    (el) => el.tabIndex >= 0 && !el.closest("[inert]") && el.getClientRects().length > 0
  );
}

// ── Scroll lock (ref-counted so overlapping dialogs don't fight) ──────────
let lockCount = 0;
let saved = null;
function lockScroll() {
  if (lockCount++ > 0) return;
  const html = document.documentElement;
  const sbw = window.innerWidth - html.clientWidth;
  saved = { overflow: html.style.overflow, sbw: html.style.getPropertyValue("--lock-sbw") };
  html.style.setProperty("--lock-sbw", `${Math.max(0, sbw)}px`);
  html.style.overflow = "hidden";
  html.setAttribute("data-scroll-locked", "");
}
function unlockScroll() {
  if (--lockCount > 0) return;
  lockCount = 0;
  const html = document.documentElement;
  html.style.overflow = saved ? saved.overflow : "";
  if (saved && saved.sbw) html.style.setProperty("--lock-sbw", saved.sbw);
  else html.style.removeProperty("--lock-sbw");
  html.removeAttribute("data-scroll-locked");
  saved = null;
}

// ── Inert everything outside the dialog ───────────────────────────────────
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEMPLATE", "LINK", "NEXT-ROUTE-ANNOUNCER"]);
function inertOutside(container, keep) {
  const touched = [];
  let node = container;
  while (node && node.parentElement && node !== document.body) {
    for (const sib of node.parentElement.children) {
      if (sib === node || SKIP_TAGS.has(sib.tagName)) continue;
      if (keep.some((k) => k && (k === sib || sib.contains(k)))) continue;
      if (sib.hasAttribute("inert")) continue; // already inert; leave it as found
      sib.setAttribute("inert", "");
      touched.push(sib);
    }
    node = node.parentElement;
  }
  return () => touched.forEach((el) => el.removeAttribute("inert"));
}

export function useDialog({ open, onClose, containerRef, initialFocusRef, keepRefs = [], fallbackFocus }) {
  // Keep the latest onClose without re-running the open effect every render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const keepRefsRef = useRef(keepRefs);
  keepRefsRef.current = keepRefs;

  useEffect(() => {
    if (!open) return;
    const container = containerRef.current;
    if (!container) return;

    const opener = document.activeElement;
    lockScroll();
    const restoreInert = inertOutside(container, keepRefsRef.current.map((r) => r && r.current));

    const target = (initialFocusRef && initialFocusRef.current) || getTabbables(container)[0] || container;
    target.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current && onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = getTabbables(container);
      if (items.length === 0) { e.preventDefault(); container.focus({ preventScroll: true }); return; }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = container.contains(active);
      if (e.shiftKey && (active === first || !inside)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (active === last || !inside)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      restoreInert();
      unlockScroll();
      // Return focus to the opener unless it vanished or is now hidden/inert.
      const ok = opener && opener !== document.body && opener.isConnected &&
        !container.contains(opener) && !opener.closest("[inert]") && opener.getClientRects().length > 0;
      const back = ok ? opener : (fallbackFocus ? document.querySelector(fallbackFocus) : null);
      if (back && typeof back.focus === "function") back.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
