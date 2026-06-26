// screens/_admin_chrome.js
// Shared admin sidebar nav. Drops into:
//   <body class="admin"><div class="admin-layout">
//     <div data-admin-chrome="side"></div>
//     <main class="admin-content">…</main>
//   </div></body>

(function () {
  const SIDE = `
<aside class="admin-side" aria-label="Admin navigation">
  <div class="admin-brand">
    joywave<span style="color:var(--fg-muted);font-weight:500">/digital</span>
    <small>admin</small>
  </div>

  <nav class="admin-nav">
    <div class="admin-nav-group">
      <h3>Catalog</h3>
      <ul>
        <li><a href="admin-products.html" data-anav="products">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          Products
        </a></li>
        <li><a href="#" data-anav="categories">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 7h7l2 3h9v11H3z"/></svg>
          Categories
        </a></li>
        <li><a href="#" data-anav="tags">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M20 12 12 4H4v8l8 8z"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/></svg>
          Tags
        </a></li>
      </ul>
    </div>

    <div class="admin-nav-group">
      <h3>Orders</h3>
      <ul>
        <li><a href="admin-orders.html" data-anav="orders">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 4h2l2.5 12.5a2 2 0 0 0 2 1.5h8a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/></svg>
          Orders
        </a></li>
        <li><a href="#" data-anav="refunds">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
          Refunds
        </a></li>
      </ul>
    </div>

    <div class="admin-nav-group">
      <h3>Customers</h3>
      <ul>
        <li><a href="#" data-anav="customers">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
          Customers
        </a></li>
        <li><a href="#" data-anav="messages">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 6h18v12H7l-4 3z"/></svg>
          Messages
        </a></li>
        <li><a href="#" data-anav="reviews">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 2 14.5 8.7 22 9.3l-5.6 4.9L18 22l-6-3.6L6 22l1.6-7.8L2 9.3l7.5-.6Z"/></svg>
          Reviews
        </a></li>
      </ul>
    </div>

    <div class="admin-nav-group">
      <h3>Marketing</h3>
      <ul>
        <li><a href="#" data-anav="coupons">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z"/><path d="M9 8v8" stroke-dasharray="2 2"/></svg>
          Coupons
        </a></li>
        <li><a href="#" data-anav="email">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="3" y="5" width="18" height="14"/><path d="m3 7 9 6 9-6"/></svg>
          Email
        </a></li>
      </ul>
    </div>

    <div class="admin-nav-group">
      <h3>Content</h3>
      <ul>
        <li><a href="#" data-anav="blog">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h4"/></svg>
          Blog
        </a></li>
      </ul>
    </div>

    <div class="admin-nav-group">
      <h3>Insights</h3>
      <ul>
        <li><a href="admin-insights.html" data-anav="insights">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 20h18"/><path d="M5 16v-6"/><path d="M11 16V8"/><path d="M17 16v-4"/></svg>
          Insights
        </a></li>
      </ul>
    </div>

    <div class="admin-nav-group">
      <h3>System</h3>
      <ul>
        <li><a href="#" data-anav="settings">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.2-1.7l2.1-1.6-2-3.5-2.4 1a7 7 0 0 0-2.9-1.7L13.1 2h-2.2l-.5 2.5a7 7 0 0 0-2.9 1.7l-2.4-1-2 3.5L5.2 10.3A7 7 0 0 0 5 12c0 .6.1 1.1.2 1.7l-2.1 1.6 2 3.5 2.4-1a7 7 0 0 0 2.9 1.7l.5 2.5h2.2l.5-2.5a7 7 0 0 0 2.9-1.7l2.4 1 2-3.5-2.1-1.6c.1-.6.2-1.1.2-1.7z"/></svg>
          Settings
        </a></li>
      </ul>
    </div>
  </nav>

  <div class="admin-user">
    <div class="who">Onkar K.</div>
    <div class="what">Owner · Mumbai</div>
  </div>
</aside>`;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(() => {
    const slot = document.querySelector('[data-admin-chrome="side"]');
    if (slot) slot.outerHTML = SIDE;
    const active = document.documentElement.getAttribute('data-admin-active');
    if (active) {
      const link = document.querySelector(`[data-anav="${active}"]`);
      if (link) link.setAttribute('aria-current', 'page');
    }
  });
})();
