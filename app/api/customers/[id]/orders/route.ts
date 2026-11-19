import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Only admins can view another user's orders
  const user = session.user as { role?: string; id: string };
  if (user.role !== "admin" && user.id !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      totalINR: true,
      orderStatus: true,
      paymentStatus: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ orders });
}
