export interface BillingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export type BillingErrors = Partial<Record<keyof BillingInfo, string>>;

export interface CouponValidation {
  valid: boolean;
  code: string;
  discountINR: number;
  type: "flat" | "percent";
  message?: string;
}

export interface CreatedOrder {
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  razorpayKey: string;
  amount: number;
}

export const EMPTY_BILLING: BillingInfo = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export function validateBilling(billing: BillingInfo): BillingErrors {
  const errors: BillingErrors = {};
  if (!billing.name.trim()) errors.name = "Please add your name";
  if (!billing.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billing.email)) errors.email = "I need a valid email to confirm your order";
  if (billing.phone.replace(/\D/g, "").length < 10) errors.phone = "Please add a 10-digit phone number for the courier";
  if (!billing.address.trim()) errors.address = "Please add your street address";
  if (!billing.city.trim()) errors.city = "Please add your city";
  if (!billing.state.trim()) errors.state = "Please add your state";
  if (!/^\d{6}$/.test(billing.pincode.trim())) errors.pincode = "Pincode should be 6 digits";
  return errors;
}
