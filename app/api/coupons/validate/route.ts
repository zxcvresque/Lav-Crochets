import { NextRequest, NextResponse } from "next/server";
import { checkCoupon } from "@/lib/coupons";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") || "";
  const subtotal = Math.max(0, parseInt(searchParams.get("subtotal") || "0") || 0);
  const email = searchParams.get("email");

  if (!code.trim()) {
    return NextResponse.json({ valid: false, message: "Coupon code required" }, { status: 400 });
  }

  const user = await getSessionUser(request.headers);
  const result = await checkCoupon(code, subtotal, { userId: user?.id, email: email || user?.email });

  if (!result.ok) {
    return NextResponse.json({ valid: false, message: result.message, minOrderINR: result.minOrderINR });
  }

  const { coupon, discountINR } = result;
  return NextResponse.json({
    valid: true,
    discountINR,
    type: coupon.type,
    value: coupon.value,
    code: coupon.code,
    message: coupon.type === "percent" ? `${coupon.value}% off applied!` : `₹${coupon.value} off applied!`,
  });
}
