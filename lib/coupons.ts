import { prisma } from "./prisma";
import { discountFor } from "./api";

export type CouponCheck =
  | { ok: true; coupon: { id: string; code: string; type: string; value: number }; discountINR: number }
  | { ok: false; message: string; minOrderINR?: number };

/**
 * Single source of truth for coupon rules, used by the cart preview and by order creation.
 * Only paid orders count toward usage limits (CouponUsage is written on payment verification).
 */
export async function checkCoupon(
  rawCode: string,
  subtotal: number,
  customer?: { userId?: string | null; email?: string | null }
): Promise<CouponCheck> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, message: "Coupon code required" };

  const coupon = await prisma.coupon.findUnique({
    where: { code },
    include: { _count: { select: { usages: true } } },
  });
  if (!coupon) return { ok: false, message: "Invalid coupon code" };
  if (!coupon.active) return { ok: false, message: "This coupon is no longer active" };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { ok: false, message: "This coupon has expired" };
  if (coupon.usageLimit !== null && coupon._count.usages >= coupon.usageLimit) {
    return { ok: false, message: "This coupon has reached its usage limit" };
  }
  if (subtotal < coupon.minOrderINR) {
    return { ok: false, message: `Minimum order ₹${coupon.minOrderINR} required for this coupon`, minOrderINR: coupon.minOrderINR };
  }

  // Per-customer limit: count this customer's paid orders that used the coupon (by account or email).
  const or = [];
  if (customer?.userId) or.push({ userId: customer.userId });
  if (customer?.email) or.push({ customerEmail: customer.email.toLowerCase() });
  if (or.length && coupon.perUserLimit > 0) {
    const used = await prisma.order.count({
      where: { couponId: coupon.id, paymentStatus: "paid", OR: or },
    });
    if (used >= coupon.perUserLimit) return { ok: false, message: "You've already used this coupon" };
  }

  return {
    ok: true,
    coupon: { id: coupon.id, code: coupon.code, type: coupon.type, value: coupon.value },
    discountINR: discountFor(coupon.type, coupon.value, subtotal),
  };
}
