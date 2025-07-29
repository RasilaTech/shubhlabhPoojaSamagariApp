import type { ProductVariant } from "../product/productApi.type";

export interface CartItem {
  id: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product_variant_id: string;
  user_id: string;
  variant: ProductVariant;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: CartItem[];
}

export interface AddToCartResponse {
  success: boolean;
  message: string;
  data: CartItem;
}

export interface AddToCartRequest {
  product_variant_id: string;
}

export interface ClearCartResponse {
  success: boolean;
  message: string;
}

export interface UpdateCartItemRequest {
  action: "increase" | "decrease";
}

export interface UpdateCartItemResponse {
  success: boolean;
  message: string;
  data?: CartItem;
}

export interface getCartItemByIdResponse {
  success: boolean;
  message: string;
  data: CartItem;
}
