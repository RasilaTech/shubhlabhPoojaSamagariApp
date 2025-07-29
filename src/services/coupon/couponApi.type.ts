export interface Coupon {
  id: string;
  offer_code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_discount_value: number | null;
  max_discount_value: number | null;
  min_order_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  usage_limit_per_user: number | null;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface CouponResponse {
  success: boolean;
  message: string;
  data: Coupon[];
}
