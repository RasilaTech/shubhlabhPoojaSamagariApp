import type { Meta } from "../product/productApi.type";
// src/types/order-page-props.ts

export interface OrderData {
  amount: number;
  amount_due: number;
  amount_paid: number;
  attempts: number;
  created_at: number;
  currency: string;
  entity: string;
  id: string;
  notes: string[];
  offer_id: string | null;
  receipt: string | null;
  status: string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: OrderData;
}

export interface OrderCharges {
  type: "delivery";
  name: string;
  amount: number;
}

export interface CreateOrders {
  items: OrderItems[];
  charges: OrderCharges[];
  address_id: string;
  offer_codes: string[];
  method: string;
}

interface OrderItems {
  quantity: number;
  product_variant_id: string;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface VerifyRazorpayPaymentResponse {
  success: boolean;
  message: string;
  data: RazorpayPaymentResponse;
}

export interface orderItem {
  quantity: number;
  mrp: number;
  price: number;
  product_variant_id: string;
  product_variant: {
    name: string;
    images: string[];
    display_label: string;
  };
}

export interface getOrdersParams {
  page?: number;
  limit?: number;
}

export type orderPageParam = number;

export interface OrderDetail {
  id: string;
  status:
    | "pending"
    | "accepted"
    | "processing"
    | "packed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "rejected"
    | "refunded"
    | "returned";
  order_number: 1;
  delivered_at: string | null;
  expected_delivery_date: string;
  cancellation_reason: string | null;
  createdAt: string;
  updatedAt: string;
  user_id: string;
  order_items: orderItem[];
  payment_details: {
    status: "created" | "captured" | "failed" | "refunded" | "pending" | "paid";
    amount: number;
    currency: "INR";
    method: "card" | "netbanking" | "upi" | "wallet" | "cod" | null;
  };
}

export interface OrderAddress {
  name: string;
  phone_number: string;
  city: string;
  pincode: string;
  state: string;
  address_line1: string;
  address_line2: string | null;
  landmark: string;
}

export interface OrderHistory {
  status:
    | "pending"
    | "accepted"
    | "processing"
    | "packed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "rejected"
    | "refunded"
    | "returned";
  comment: string | null;
  updatedBy: "user" | "admin" | "system";
  createdAt: string;
}

export interface OrderCoupon {
  offer_code: string;
  discount_amount: number;
  discount_type: "percentage" | "fixed";
  createdAt: string;
}

export interface OrderCharge {
  name: string;
  amount: number;
}

export interface AllOrderDetail {
  id: string;
  status:
    | "pending"
    | "accepted"
    | "processing"
    | "packed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "rejected"
    | "refunded"
    | "returned";
  order_number: number;
  delivered_at: string | null;
  expected_delivery_date: string;
  cancellation_reason: string | null;
  createdAt: string;
  updatedAt: string;
  user_id: string;
  order_items: orderItem[];
  payment_details: {
    status: "created" | "captured" | "failed" | "refunded" | "pending" | "paid";
    amount: number;
    currency: "INR";
    method: "card" | "netbanking" | "upi" | "wallet" | "cod" | null;
  };
  order_charges: OrderCharge[];
  order_address: OrderAddress;
  order_histories: OrderHistory[];
  order_coupons: OrderCoupon[] | [];
}

export interface getOrdersResponse {
  success: boolean;
  message: string;
  data: OrderDetail[];
  meta: Meta;
}

export interface OrderByIdResponse {
  success: boolean;
  message: string;
  data: AllOrderDetail;
}

export interface OrderCancelResponse {
  success: boolean;
  message: string;
}

export interface CancelOrderPayload {
  reason: string;
} // Adjust path if needed

// Interface for OrderDetailMainCard, OrderItemSummaryCard, PaymentSummaryCard
export interface OrderDetailMainCardProps {
  orderDetails: AllOrderDetail;
}

// Interface for DelhiveryDetailCard
export interface DelhiveryDetailCardProps {
  orderAddress: OrderAddress;
}
