import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/email";
import { reportError } from "@/lib/report-error";

/**
 * Mark the order behind a Razorpay order as paid. Idempotent: the checkout
 * verify call and the payment webhook can both arrive, in either order, and
 * only the first one flips the status, records the coupon and sends the email.
 */
export async function markOrderPaid(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string | null;
}) {
  const existing = await prisma.order.findUnique({ where: { razorpayOrderId: input.razorpayOrderId } });
  if (!existing) return { ok: false as const, reason: "not_found" as const };
  if (existing.paymentStatus === "paid") return { ok: true as const, order: existing, alreadyPaid: true };

  // Conditional update so two racing callers can't both "win".
  const claimed = await prisma.order.updateMany({
    where: { id: existing.id, paymentStatus: { not: "paid" } },
    data: {
      razorpayPaymentId: input.razorpayPaymentId,
      ...(input.razorpaySignature ? { razorpaySignature: input.razorpaySignature } : {}),
      paymentStatus: "paid",
      orderStatus: existing.orderStatus === "pending" ? "confirmed" : existing.orderStatus,
    },
  });
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: existing.id },
    include: { items: { include: { product: true } } },
  });
  if (claimed.count === 0) return { ok: true as const, order, alreadyPaid: true };

  if (order.couponId) {
    await prisma.couponUsage.upsert({
      where: { orderId: order.id },
      update: {},
      create: { couponId: order.couponId, userId: order.userId, orderId: order.id },
    });
  }

  try {
    const maxTurnaround = Math.max(0, ...order.items.map((i) => i.product?.turnaroundDays ?? 0));
    await sendOrderConfirmation({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: order.items.map((item) => ({ title: item.title, priceINR: item.priceINR, qty: item.qty, options: item.options })),
      subtotalINR: order.subtotalINR,
      discountINR: order.discountINR,
      totalINR: order.totalINR,
      couponCode: order.couponCode ?? undefined,
      turnaroundDays: maxTurnaround,
      estimatedDelivery: order.estimatedDelivery ?? undefined,
    });
  } catch (emailError) {
    reportError(emailError, { where: "markOrderPaid:sendOrderConfirmation", orderNumber: order.orderNumber });
  }

  return { ok: true as const, order, alreadyPaid: false };
}

/** Record a failed attempt, without touching an order that was paid meanwhile. */
export async function markOrderPaymentFailed(razorpayOrderId: string) {
  await prisma.order.updateMany({
    where: { razorpayOrderId, paymentStatus: "pending" },
    data: { paymentStatus: "failed" },
  });
}
