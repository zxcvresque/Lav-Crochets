import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { fmtPriceINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const QUEUE = [
  { status: "confirmed", label: "To start", hint: "Paid, not started yet" },
  { status: "making", label: "On the hook", hint: "Being made now" },
  { status: "ready", label: "Ready to post", hint: "Finished, waiting to ship" },
] as const;

const STATUS_LABEL: Record<string, string> = {
  pending: "Awaiting payment",
  confirmed: "Confirmed",
  making: "Making",
  ready: "Ready",
  shipped: "Shipped",
  delivered: "Delivered",
};

export default async function AdminOverview() {
  // The admin layout already enforces this; checked again so the page is safe on its own.
  const user = await getSessionUser(await headers());
  if (!isAdmin(user)) redirect("/auth/login?redirect=/admin");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const paidThisMonth = { createdAt: { gte: startOfMonth }, paymentStatus: "paid" };

  const [queueCounts, monthOrders, monthRevenue, paidAllTime, customers, activeCoupons, needsPhotos, recentOrders] =
    await Promise.all([
      Promise.all(QUEUE.map((q) => prisma.order.count({ where: { orderStatus: q.status, paymentStatus: "paid" } }))),
      prisma.order.count({ where: paidThisMonth }),
      prisma.order.aggregate({ _sum: { totalINR: true }, where: paidThisMonth }),
      prisma.order.count({ where: { paymentStatus: "paid" } }),
      prisma.user.count({ where: { role: "customer" } }),
      prisma.coupon.count({ where: { active: true } }),
      prisma.product.findMany({
        where: { published: true, OR: [{ images: null }, { images: "[]" }, { images: "" }] },
        orderBy: { sortOrder: "asc" },
        select: { id: true, title: true },
      }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    ]);

  const firstName = (user?.name || "").split(" ")[0];
  const month = now.toLocaleDateString("en-IN", { month: "long" });

  return (
    <div className="admin-overview">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{firstName ? `Hi ${firstName}` : "Studio overview"}</h1>
          <p className="admin-page-sub">
            {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <a className="btn" href="/admin/products?new=1">Add a product</a>
      </header>

      <section aria-labelledby="queue-h" className="admin-block">
        <h2 id="queue-h" className="admin-block-title">Order queue</h2>
        <ol className="admin-queue">
          {QUEUE.map((q, i) => (
            <li key={q.status}>
              <a href={`/admin/orders?status=${q.status}`} className={`admin-queue-step ${queueCounts[i] ? "has" : ""}`}>
                <span className="admin-queue-count">{queueCounts[i]}</span>
                <span className="admin-queue-label">{q.label}</span>
                <span className="admin-queue-hint">{q.hint}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <dl className="admin-figures">
        <div><dt>Revenue in {month}</dt><dd>{fmtPriceINR(monthRevenue._sum.totalINR ?? 0)}</dd></div>
        <div><dt>Orders in {month}</dt><dd>{monthOrders}</dd></div>
        <div><dt>Paid orders, all time</dt><dd>{paidAllTime}</dd></div>
        <div><dt><a href="/admin/customers">Customers</a></dt><dd>{customers}</dd></div>
        <div><dt><a href="/admin/coupons">Active coupons</a></dt><dd>{activeCoupons}</dd></div>
      </dl>

      <div className="admin-overview-grid">
        <section aria-labelledby="recent-h" className="admin-block">
          <div className="admin-block-head">
            <h2 id="recent-h" className="admin-block-title">Recent orders</h2>
            <a className="btn ghost" href="/admin/orders">All orders</a>
          </div>
          {recentOrders.length === 0 ? (
            <p className="admin-empty-note">
              No orders yet. When someone checks out, their order shows up here with its payment and making status.
            </p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Order</th><th>Customer</th><th className="num">Total</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td><a className="admin-order-link" href={`/admin/orders/${o.id}`}>#{o.orderNumber}</a></td>
                      <td>{o.customerName || o.customerEmail}</td>
                      <td className="num">{fmtPriceINR(o.totalINR)}</td>
                      <td>
                        <span className="admin-status-chip" data-status={o.paymentStatus === "paid" ? o.orderStatus : `pay-${o.paymentStatus}`}>
                          {o.paymentStatus === "paid" ? STATUS_LABEL[o.orderStatus] ?? o.orderStatus : o.paymentStatus === "failed" ? "Payment failed" : "Awaiting payment"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section aria-labelledby="photos-h" className="admin-block">
          <div className="admin-block-head">
            <h2 id="photos-h" className="admin-block-title">Needs photos</h2>
            <span className="admin-block-count">{needsPhotos.length}</span>
          </div>
          {needsPhotos.length === 0 ? (
            <p className="admin-empty-note">Every published product has a photo.</p>
          ) : (
            <ul className="admin-plain-list">
              {needsPhotos.map((p) => (
                <li key={p.id}><a href={`/admin/products?edit=${p.id}`}>{p.title}</a></li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
