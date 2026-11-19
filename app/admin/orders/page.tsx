"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fmtPriceINR } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalINR: number;
  orderStatus: string;
  paymentStatus: string;
  items: Array<{ title: string; qty: number }>;
  createdAt: string;
}

const STATUS_FILTERS = [
  { value: "", label: "All orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "making", label: "Making" },
  { value: "ready", label: "Ready" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  making: "Making",
  ready: "Ready",
  shipped: "Shipped",
  delivered: "Delivered",
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function loadOrders() {
    setLoading(true);
    const url = `/api/orders?status=${filter}&page=${page}&limit=20`;
    const res = await fetch(url);
    const data = await res.json();
    setOrders(data.orders ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }

  // Deep link from the overview queue: /admin/orders?status=making
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("status");
    if (s) setFilter(s);
  }, []);

  useEffect(() => { loadOrders(); }, [filter, page]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <h1 className="admin-page-title">Orders</h1>
      <p className="admin-page-sub">{total} order{total !== 1 ? "s" : ""}</p>

      {/* Status filters */}
      <div className="shop-filters admin-filter-tabs">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            className={`shop-filter ${filter === f.value ? "active" : ""}`}
            onClick={() => { setFilter(f.value); setPage(1); }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="admin-table-wrap">
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--fg-muted)" }}>Loading...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--fg-muted)" }}>No orders found</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/admin/orders/${order.id}`} className="admin-order-link">
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{order.customerName}</div>
                    <div style={{ fontSize: "var(--step--3)", color: "var(--fg-muted)" }}>{order.customerEmail}</div>
                  </td>
                  <td style={{ color: "var(--fg-muted)", fontSize: "var(--step--2)" }}>
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                    {fmtPriceINR(order.totalINR)}
                  </td>
                  <td>
                    <span
                      className="admin-status-chip"
                      data-status={`pay-${order.paymentStatus}`}
                    >
                      {PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span
                      className="admin-status-chip"
                      data-status={order.orderStatus}
                    >
                      {STATUS_LABELS[order.orderStatus]}
                    </span>
                  </td>
                  <td style={{ color: "var(--fg-muted)", fontSize: "var(--step--2)" }}>
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td>
                    <Link href={`/admin/orders/${order.id}`} className="admin-view-link">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button className="btn outline" style={{ height: "36px", padding: "0 16px", fontSize: "var(--step--2)" }} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Previous
          </button>
          <span style={{ fontSize: "var(--step--2)", color: "var(--fg-muted)" }}>Page {page} of {totalPages}</span>
          <button className="btn outline" style={{ height: "36px", padding: "0 16px", fontSize: "var(--step--2)" }} onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
