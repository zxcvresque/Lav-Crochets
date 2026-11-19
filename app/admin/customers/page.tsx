"use client";

import { useState, useEffect } from "react";
import { fmtPriceINR } from "@/lib/utils";

interface Customer {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  _count: { orders: number };
  totalSpent: number;
}

interface OrderSummary {
  id: string;
  orderNumber: string;
  totalINR: number;
  orderStatus: string;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Record<string, OrderSummary[]>>({});
  const [loadingOrders, setLoadingOrders] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/customers?page=${page}&search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then((data) => {
        setCustomers(data.customers ?? []);
        setTotal(data.total ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, search]);

  async function toggleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!customerOrders[id]) {
      setLoadingOrders(id);
      try {
        const res = await fetch(`/api/customers/${id}/orders`);
        if (res.ok) {
          const data = await res.json();
          setCustomerOrders((prev) => ({ ...prev, [id]: data.orders ?? [] }));
        }
      } finally {
        setLoadingOrders(null);
      }
    }
  }

  const totalPages = Math.ceil(total / 20);
  const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    making: "Making",
    ready: "Ready",
    shipped: "Shipped",
  delivered: "Delivered",
  };

  return (
    <div>
      <h1 className="admin-page-title">Customers</h1>
      <p className="admin-page-sub">{total} registered customer{total !== 1 ? "s" : ""}</p>

      {/* Search */}
      <div className="admin-search-row">
        <div className="admin-search-input-wrap">
          <SearchIcon />
          <input
            type="search"
            className="admin-search-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--fg-muted)" }}>Loading...</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--fg-muted)" }}>
            {search ? "No customers match your search." : "No customers yet."}
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Orders</th>
                <th>Total spent</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <>
                  <tr key={c.id} className={`admin-customer-row ${expandedId === c.id ? "expanded" : ""}`}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div className="admin-avatar">
                          {c.image ? (
                            <img src={c.image} alt={c.name ?? c.email} />
                          ) : (
                            <span>{(c.name ?? c.email).charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}>
                            <span>{c.name ?? "—"}</span>
                            {c.role === "admin" && (
                              <span style={{ fontSize: "var(--step--5)", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", background: "var(--joy-500)", color: "var(--joy-950)", padding: "1px 6px", borderRadius: "999px" }}>
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          className={`admin-expand-btn ${expandedId === c.id ? "open" : ""}`}
                          onClick={() => toggleExpand(c.id)}
                          title={expandedId === c.id ? "Collapse" : "View orders"}
                        >
                          <ChevronIcon />
                        </button>
                      </div>
                    </td>
                    <td style={{ color: "var(--fg-soft)", fontSize: "var(--step--2)" }}>{c.email}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{c._count.orders}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                      {c.totalSpent > 0 ? fmtPriceINR(c.totalSpent) : "—"}
                    </td>
                    <td style={{ color: "var(--fg-muted)", fontSize: "var(--step--2)" }}>
                      {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                  {expandedId === c.id && (
                    <tr key={`${c.id}-orders`} className="admin-orders-row">
                      <td colSpan={5} style={{ padding: "0 16px 16px", background: "var(--bg-subtle)" }}>
                        {loadingOrders === c.id ? (
                          <div style={{ padding: "16px 0", color: "var(--fg-muted)", fontSize: "var(--step--2)" }}>Loading orders...</div>
                        ) : customerOrders[c.id]?.length ? (
                          <div className="admin-orders-list">
                            {customerOrders[c.id].map((o) => (
                              <a key={o.id} href={`/admin/orders/${o.id}`} className="admin-order-chip">
                                <span className="admin-order-chip-num">#{o.orderNumber}</span>
                                <span className="admin-order-chip-total">{fmtPriceINR(o.totalINR)}</span>
                                <span
                                  className="admin-order-chip-status"
                                  data-status={o.orderStatus}
                                >
                                  {STATUS_LABELS[o.orderStatus]}
                                </span>
                                <span className="admin-order-chip-date">
                                  {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: "16px 0", color: "var(--fg-muted)", fontSize: "var(--step--2)" }}>No orders yet.</div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="admin-pagination">
          <button className="btn outline" style={{ height: "36px", padding: "0 16px", fontSize: "var(--step--2)" }} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</button>
          <span style={{ fontSize: "var(--step--2)", color: "var(--fg-muted)" }}>Page {page} of {totalPages}</span>
          <button className="btn outline" style={{ height: "36px", padding: "0 16px", fontSize: "var(--step--2)" }} onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>Next</button>
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}

function ChevronIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
}
