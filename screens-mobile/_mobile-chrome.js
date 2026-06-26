/*
 * screens-mobile/_mobile-chrome.js
 * ─────────────────────────────────────────────────────────────────────────
 * Shared mobile chrome: status bar + announcement bar + header + home
 * indicator. Each mobile mockup drops in placeholders and this script
 * injects the markup so we keep per-file size manageable.
 *
 *  <body>
 *    <div class="mob-stage" data-stage>
 *      <div data-chrome="status"></div>
 *      <div data-chrome="announce"></div>
 *      <div data-chrome="header" data-cart-count="2"></div>
 *      <main class="mob-main"> ... screen body ... </main>
 *      <div data-chrome="home"></div>
 *    </div>
 *    <script src="_mobile-chrome.js"></script>
 *  </body>
 *
 * Pass `data-cart-count` on the header slot to set the bubble count.
 * Pass `data-no-announce` on the stage to suppress the announcement bar.
 * ─────────────────────────────────────────────────────────────────────────
 */

(function () {
  const ICON = {
    menu:   '<svg class="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 7h18M3 17h18"/></svg>',
    search: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    cart:   '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 4h2l2.5 12.5a2 2 0 0 0 2 1.5h8a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/></svg>',
    user:   '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>',
    brand:  '<svg width="22" height="22" viewBox="0 0 28 28" aria-hidden="true"><rect width="28" height="28" rx="9" fill="var(--joy-500)"/><path d="M3 16 C 7 8, 9 24, 13 16 S 19 8, 21 16 S 25 24, 27 16" stroke="var(--joy-950)" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="14" cy="7" r="2" fill="var(--joy-950)"/></svg>',
    signal: '<svg width="14" height="10" viewBox="0 0 18 12"><path d="M1 9h2v3H1zM5 6h2v6H5zM9 3h2v9H9zM13 0h2v12h-2z" fill="currentColor"/></svg>',
    wifi:   '<svg width="14" height="11" viewBox="0 0 18 13"><path d="M9 12.5l1.5-1.5a2 2 0 1 0-3 0L9 12.5z" fill="currentColor"/><path d="M2 5a10 10 0 0 1 14 0M5 8a6 6 0 0 1 8 0" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>',
    battery:'<svg width="22" height="11" viewBox="0 0 26 13"><rect x="0.5" y="0.5" width="22" height="12" rx="3" fill="none" stroke="currentColor"/><rect x="2" y="2" width="18" height="9" rx="1.5" fill="currentColor"/><rect x="23" y="4" width="2" height="5" rx="1" fill="currentColor"/></svg>',
  };

  function statusBar(time = "9:41") {
    return `
<div class="mob-statusbar" aria-hidden="true">
  <span>${time}</span>
  <div class="island"></div>
  <div class="right">
    ${ICON.signal}
    ${ICON.wifi}
    ${ICON.battery}
  </div>
</div>`;
  }

  function announce() {
    return `
<div class="mob-announce" aria-label="Site-wide announcement">
  <div class="mob-announce-track">
    <span><i class="dot"></i>Free worldwide shipping on digital goods</span>
    <span><i class="dot"></i>Instant download after checkout</span>
    <span><i class="dot"></i>No account required for first purchase</span>
    <span><i class="dot"></i>Free worldwide shipping on digital goods</span>
    <span><i class="dot"></i>Instant download after checkout</span>
    <span><i class="dot"></i>No account required for first purchase</span>
  </div>
</div>`;
  }

  function header(cartCount = 0, signedIn = false) {
    return `
<header class="mob-header" role="banner">
  <button class="mob-hamburger" aria-label="Open menu" type="button">${ICON.menu}</button>
  <a href="#" class="mob-brand" aria-label="JoyWaveDigital home">
    ${ICON.brand}
    <span>joywave<span class="sep">/digital</span></span>
  </a>
  <div class="mob-actions">
    <button class="mob-icon" aria-label="Search printables" type="button">${ICON.search}</button>
    <a href="#" class="mob-icon" aria-label="${signedIn ? 'Account' : 'Sign in'}">${ICON.user}</a>
    <a href="#" class="mob-icon" aria-label="Cart, ${cartCount} items">
      ${ICON.cart}
      ${cartCount > 0 ? `<span class="mob-cart-count" aria-live="polite">${cartCount}</span>` : ''}
    </a>
  </div>
</header>`;
  }

  function homeBar() { return `<div class="mob-homebar" aria-hidden="true"></div>`; }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(() => {
    document.querySelectorAll('[data-chrome="status"]').forEach((el) => {
      const time = el.getAttribute("data-time") || "9:41";
      el.outerHTML = statusBar(time);
    });
    document.querySelectorAll('[data-chrome="announce"]').forEach((el) => {
      const stage = el.closest("[data-stage]");
      if (stage && stage.hasAttribute("data-no-announce")) { el.remove(); return; }
      el.outerHTML = announce();
    });
    document.querySelectorAll('[data-chrome="header"]').forEach((el) => {
      const count = parseInt(el.getAttribute("data-cart-count") || "0", 10);
      const signedIn = el.hasAttribute("data-signed-in");
      el.outerHTML = header(count, signedIn);
    });
    document.querySelectorAll('[data-chrome="home"]').forEach((el) => {
      el.outerHTML = homeBar();
    });
  });
})();
