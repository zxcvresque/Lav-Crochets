import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { fmtPriceINR } from "@/lib/utils";
import { SignOutButton } from "@/components/SignOutButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | Lav Crochets",
};

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "var(--warn)", bg: "color-mix(in oklch, var(--warn) 12%, transparent)" },
  confirmed: { label: "Confirmed", color: "var(--ok)", bg: "color-mix(in oklch, var(--ok) 12%, transparent)" },
  making: { label: "Being made", color: "var(--pick)", bg: "color-mix(in oklch, var(--pick) 12%, transparent)" },
  ready: { label: "Ready to ship", color: "var(--ok)", bg: "color-mix(in oklch, var(--ok) 12%, transparent)" },
  shipped: { label: "Shipped", color: "var(--info)", bg: "color-mix(in oklch, var(--info) 12%, transparent)" },
  delivered: { label: "Delivered", color: "var(--ok)", bg: "color-mix(in oklch, var(--ok) 12%, transparent)" },
};

function OrderStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: "var(--step--4)", fontWeight: 700, color: style.color, background: style.bg }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
      {style.label}
    </span>
  );
}

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <div className="account-page">
        <div className="wrap">
          <div style={{ textAlign: "center", padding: "80px 0", maxWidth: 480, margin: "0 auto" }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--fg-muted)" strokeWidth="1.2" style={{ margin: "0 auto 20px" }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--step-8)", fontWeight: 600, marginBottom: 12 }}>Sign in to your account</h1>
            <p style={{ color: "var(--fg-muted)", marginBottom: 24, lineHeight: 1.6 }}>
              Track your orders, save your details, and get a faster checkout.
            </p>
            <Link href="/auth/login" className="btn btn-flash xl" style={{ marginBottom: 12 }}>
              Sign in
            </Link>
            <p style={{ fontSize: "var(--step--2)", color: "var(--fg-muted)" }}>
              New here?{" "}
              <Link href="/auth/signup" style={{ color: "var(--fg)", fontWeight: 600 }}>Create account</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
    },
  });

  if (!user) redirect("/auth/login");

  return (
    <div className="account-page">
      <div className="wrap">
        {/* Header */}
        <div className="account-header">
          <div>
            <h1>My Account</h1>
            <p style={{ color: "var(--fg-soft)", marginTop: 8 }}>Welcome back, {user.name || user.email}</p>
          </div>
        <SignOutButton />
        </div>

        <div className="account-layout">
          {/* Profile */}
          <section className="account-card">
            <h2 className="account-card-title">Profile</h2>
            <div className="profile-fields">
              <div>
                <span className="profile-label">Name</span>
                <span className="profile-value">{user.name || "—"}</span>
              </div>
              <div>
                <span className="profile-label">Email</span>
                <span className="profile-value">{user.email}</span>
              </div>
              <div>
                <span className="profile-label">Account type</span>
                <span className="profile-value" style={{ textTransform: "capitalize" }}>{user.role}</span>
              </div>
            </div>
          </section>

          {/* Orders */}
          <section className="account-card" style={{ gridColumn: "1 / -1" }}>
            <h2 className="account-card-title">Order History</h2>
            {user.orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--fg-muted)" }}>
                <p>No orders yet.</p>
                <Link href="/shop" className="btn outline" style={{ marginTop: 16 }}>Browse the shop</Link>
              </div>
            ) : (
              <div className="orders-list">
                {user.orders.map((order) => (
                  <div key={order.id} className="order-row">
                    <div className="order-row-head">
                      <div>
                        <span className="order-number">#{order.orderNumber}</span>
                        <span className="order-date">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <OrderStatusBadge status={order.orderStatus} />
                    </div>
                    <div className="order-items">
                      {order.items.map((item) => (
                        <span key={item.id} className="order-item-chip">
                          {item.title} × {item.qty}
                        </span>
                      ))}
                    </div>
                    <div className="order-row-foot">
                      <span className="order-total">{fmtPriceINR(order.totalINR)}</span>
                      {order.estimatedDelivery && (
                        <span className="order-delivery">Est. delivery: {order.estimatedDelivery}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <style>{`
        .account-page {
          padding: var(--s-7) 0 var(--s-9);
        }
        .account-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: var(--s-7);
        }
        .account-header h1 {
          font-family: var(--font-display);
          font-size: var(--step-9);
          font-weight: 600;
          letter-spacing: -0.03em;
          line-height: 1;
          margin: 0;
        }
        .account-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .account-card {
          background: var(--bg);
          border: 1px solid var(--line);
          border-radius: var(--r-4);
          padding: 28px;
        }
        .account-card-title {
          font-family: var(--font-display);
          font-size: var(--step-3);
          font-weight: 600;
          margin: 0 0 20px;
        }
        .profile-fields {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .profile-label {
          display: block;
          font-size: var(--step--4);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--fg-muted);
          margin-bottom: 4px;
        }
        .profile-value {
          font-size: var(--step-0);
          font-weight: 500;
        }
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .order-row {
          border: 1px solid var(--line);
          border-radius: var(--r-3);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .order-row-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .order-number {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: var(--step--2);
          margin-right: 12px;
        }
        .order-date {
          font-size: var(--step--4);
          color: var(--fg-muted);
        }
        .order-items {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .order-item-chip {
          font-size: var(--step--4);
          padding: 3px 10px;
          border-radius: 999px;
          background: var(--bg-subtle);
          color: var(--fg-soft);
        }
        .order-row-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .order-total {
          font-family: var(--font-display);
          font-size: var(--step-0);
          font-weight: 600;
        }
        .order-delivery {
          font-size: var(--step--4);
          color: var(--fg-muted);
        }
        @media (max-width: 768px) {
          .account-layout { grid-template-columns: 1fr; }
          .account-card { grid-column: auto; }
        }
      `}</style>
    </div>
  );
}
