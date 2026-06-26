// screens/_chrome.js
// Shared header + footer for all per-route mockups. Each screen drops in:
//   <div data-chrome="header"></div>  ...  <div data-chrome="footer"></div>
//   <script src="_chrome.js"></script>
// and this script injects the proper markup, wires up the scroll-shrink
// behaviour, and highlights the active nav link based on document.title.

(function () {
  const HEADER = `
<div class="header-wrap">
  <div class="header">
    <a href="../index.html" class="brand" aria-label="JoyWaveDigital home">
      <svg width="26" height="26" viewBox="0 0 28 28" aria-hidden="true">
        <rect width="28" height="28" rx="9" fill="var(--joy-500)"/>
        <path d="M3 16 C 7 8, 9 24, 13 16 S 19 8, 21 16 S 25 24, 27 16" stroke="var(--joy-950)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <circle cx="14" cy="7" r="2" fill="var(--joy-950)"/>
      </svg>
      <span>joywave<span style="color:var(--fg-muted);font-weight:500">/digital</span></span>
    </a>
    <nav aria-label="Primary">
      <a href="shop.html" data-nav="shop">Shop</a>
      <a href="teacher-bundles.html" data-nav="bundles">Bundles</a>
      <a href="freebies.html" data-nav="freebies">Freebies</a>
      <a href="about.html" data-nav="story">Story</a>
      <a href="blog.html" data-nav="blog">Notes</a>
    </nav>
    <div class="header-actions">
      <button class="iconbtn" aria-label="Search" type="button">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      </button>
      <a href="sign-in.html" class="iconbtn" aria-label="Account">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
      </a>
      <a href="cart.html" class="iconbtn" aria-label="Cart, 2 items">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 4h2l2.5 12.5a2 2 0 0 0 2 1.5h8a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/></svg>
        <span class="cart-count" aria-live="polite">2</span>
      </a>
    </div>
  </div>
</div>`;

  const FOOTER = `
<footer class="footer" id="footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
          <svg width="36" height="36" viewBox="0 0 28 28" aria-hidden="true">
            <rect width="28" height="28" rx="9" fill="var(--joy-500)"/>
            <path d="M3 16 C 7 8, 9 24, 13 16 S 19 8, 21 16 S 25 24, 27 16" stroke="var(--joy-950)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
            <circle cx="14" cy="7" r="2" fill="var(--joy-950)"/>
          </svg>
          <span class="font-display" style="font-size:26px;font-weight:600;letter-spacing:-0.02em">joywave<span style="opacity:.55">/digital</span></span>
        </div>
        <p style="color:color-mix(in oklch, var(--paper) 72%, transparent);max-width:44ch;font-size:15px;line-height:1.5">A one-person printables shop. Made in Mumbai, sold worldwide. The kid is the user, the adult is the buyer; this shop respects both.</p>
      </div>
      <div>
        <h4>Shop</h4>
        <ul>
          <li><a href="shop.html">All printables</a></li>
          <li><a href="#">Worksheets</a></li>
          <li><a href="#">Readers</a></li>
          <li><a href="freebies.html">Freebies</a></li>
          <li><a href="teacher-bundles.html">Bundles</a></li>
          <li><a href="homeschool.html">Homeschool</a></li>
        </ul>
      </div>
      <div>
        <h4>Account</h4>
        <ul>
          <li><a href="account-library.html">Library</a></li>
          <li><a href="account-orders.html">Orders</a></li>
          <li><a href="account-wishlist.html">Wishlist</a></li>
          <li><a href="orders-recover.html">Recover a receipt</a></li>
        </ul>
      </div>
      <div>
        <h4>Shop info</h4>
        <ul>
          <li><a href="about.html">About</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="faq.html">FAQ</a></li>
          <li><a href="policies-refunds.html">Refunds</a></li>
          <li><a href="policies-privacy.html">Privacy</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <span>© 2026 JoyWaveDigital.</span>
        <span style="opacity:.5">·</span>
        <span>Prices charged in USD.</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>
        <label for="curr" style="opacity:.7">Display currency</label>
        <select id="curr" style="background:transparent;color:var(--paper);border:1px solid color-mix(in oklch, var(--paper) 20%, transparent);border-radius:99px;padding:5px 28px 5px 12px;font-family:var(--font-mono);font-size:11px;letter-spacing:.04em;cursor:pointer">
          <option style="color:black">USD</option>
          <option style="color:black">INR</option>
          <option style="color:black">EUR</option>
          <option style="color:black">GBP</option>
        </select>
      </div>
    </div>
  </div>
</footer>`;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(() => {
    const headerSlot = document.querySelector('[data-chrome="header"]');
    const footerSlot = document.querySelector('[data-chrome="footer"]');
    if (headerSlot) headerSlot.outerHTML = HEADER;
    if (footerSlot) footerSlot.outerHTML = FOOTER;

    // Active nav link
    const active = document.documentElement.getAttribute('data-active-nav');
    if (active) {
      const link = document.querySelector(`[data-nav="${active}"]`);
      if (link) link.classList.add('active');
    }

    // Scroll-shrink pill behaviour
    const wrap = document.querySelector('.header-wrap');
    if (wrap) {
      const onScroll = () => wrap.classList.toggle('scrolled', window.scrollY > 40);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  });
})();
