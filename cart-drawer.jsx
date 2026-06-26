// cart-drawer.jsx — Slide-from-right cart drawer.
// Checkout = send the order to WhatsApp; pay by UPI.

function CartDrawer({ open, onClose, lines, onRemove }) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const subtotal = lines.reduce((s, l) => s + (l.priceINR || 0) * l.qty, 0);
  const total = fmtPriceINR(subtotal);

  const copyUpi = () => {
    try {
      navigator.clipboard.writeText(CONFIG.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) { /* clipboard not available */ }
  };

  return (
    <>
      <div className={`scrim ${open ? "open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside
        className={`drawer ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="drawer-head">
          <h3>Cart <span style={{ color: "var(--fg-muted)", fontFamily: "var(--font-mono)", fontSize: 14, marginLeft: 8, fontWeight: 500 }}>{lines.length} {lines.length === 1 ? "item" : "items"}</span></h3>
          <button className="iconbtn focus-ring" onClick={onClose} aria-label="Close cart">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {lines.length === 0 ? (
            <div style={{ margin: "auto 0", textAlign: "center", color: "var(--fg-muted)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, color: "var(--fg)", marginBottom: 10 }}>
                <span className="font-italic">Empty for now.</span>
              </div>
              <p style={{ maxWidth: "28ch", margin: "0 auto 18px", fontSize: 14, lineHeight: 1.5 }}>
                Add a charm, a clip, or a little keychain to get started.
              </p>
              <a className="btn" href="shop.html" onClick={onClose}>Browse the shop <Icon name="arrow" size={14}/></a>
            </div>
          ) : (
            lines.map((l) => {
              const lineTotal = fmtPriceINR((l.priceINR || 0) * l.qty);
              const ready = l.stockStatus === "ready";
              return (
                <div className="cart-line" key={l.id}>
                  <div className="thumb"><ProductArt p={l} /></div>
                  <div className="ct">
                    <div className="t">{l.title}</div>
                    <div className="m">{ready ? "Ready to ship" : "Made to order"}{l.qty > 1 ? ` · Qty ${l.qty}` : ""}</div>
                  </div>
                  <div className="cart-line-right">
                    <div className="price">{lineTotal}</div>
                    <button className="cart-remove" onClick={() => onRemove(l.id)} aria-label={`Remove ${l.title}`}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {lines.length > 0 && (
          <div className="drawer-foot">
            <div className="cart-totals">
              <div className="row-t"><span>Subtotal (crochet)</span><span>{total}</span></div>
              <div className="row-t"><span>Shipping</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>Confirmed on WhatsApp</span></div>
              <div className="row-t grand"><span>Total</span><span>{total}</span></div>
            </div>

            <a href={buildWhatsAppHref(lines)} target="_blank" rel="noopener" className="btn btn-flash" style={{ width: "100%", justifyContent: "center", height: 48 }}>
              Send order on WhatsApp
              <Icon name="arrow" size={16} />
            </a>

            <div className="upi-pay">
              <div className="upi-pay-head"><span className="eyebrow-dot" />Pay by UPI</div>
              <div className="upi-pay-row">
                <img
                  className="upi-qr"
                  src={CONFIG.upiQrImage}
                  alt="UPI QR code"
                  width={48}
                  height={48}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <div style={{ minWidth: 0 }}>
                  <div className="upi-k">UPI ID</div>
                  <button className="upi-copy" onClick={copyUpi} aria-label="Copy UPI ID">
                    {CONFIG.upiId}
                    <Icon name={copied ? "check" : "download"} size={13} />
                  </button>
                  <div className="upi-hint">{copied ? "Copied" : "Tap to copy"}</div>
                </div>
              </div>
              <p className="upi-note">We confirm stock, the final total and shipping on WhatsApp before you pay.</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

Object.assign(window, { CartDrawer });
