import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  AddToCartRequest,
  AddToCartResponse,
  CartResponse,
  ClearCartResponse,
  getCartItemByIdResponse,
  UpdateCartItemRequest,
  UpdateCartItemResponse,
} from "./cartApi.type";
import baseQueryWithReauth from "@/api/baseQueryWithReauth";

export const cartAPI = createApi({
  reducerPath: "cartAPI",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["cartItems"],
  endpoints: (builder) => ({
    getCartItems: builder.query<CartResponse, void>({
      query: () => ({
        url: "/api/cart-items",
        method: "GET",
      }),
      providesTags: [{ type: "cartItems" }],
    }),

    addToCart: builder.mutation<AddToCartResponse, AddToCartRequest>({
      query: (body) => ({
        url: "/api/cart-items",
        method: "POST",
        data: body,
      }),

      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;

          dispatch(
            cartAPI.util.updateQueryData("getCartItems", undefined, (draft) => {
              draft.data.push(response.data);
            }),
          );
        } catch {
          // Handle error if needed
        }
      },
    }),

    clearCart: builder.mutation<ClearCartResponse, void>({
      query: () => ({
        url: "/api/cart-items",
        method: "DELETE",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          dispatch(
            cartAPI.util.updateQueryData("getCartItems", undefined, (draft) => {
              draft.data = [];
            }),
          );
        } catch {
          // Handle error if needed
        }
      },
    }),

    getCartItem: builder.query<getCartItemByIdResponse, string>({
      query: (productVariantId) => ({
        url: `/api/cart-items/${productVariantId}`,
        method: "GET",
      }),
    }),

    updateCartItem: builder.mutation<
      UpdateCartItemResponse,
      { productVariantId: string; body: UpdateCartItemRequest }
    >({
      query: ({ productVariantId, body }) => ({
        url: `/api/cart-items/${productVariantId}`,
        method: "PATCH",
        data: body,
      }),

      async onQueryStarted({ productVariantId }, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;

          dispatch(
            cartAPI.util.updateQueryData("getCartItems", undefined, (draft) => {
              if (!response.data) {
                draft.data = draft.data.filter(
                  (item) => item.product_variant_id !== productVariantId,
                );
                return;
              }
              const itemIndex = draft.data.findIndex(
                (item) =>
                  item.product_variant_id === response.data?.product_variant_id,
              );

              if (itemIndex !== -1) {
                draft.data[itemIndex] = response.data;
              }
            }),
          );
        } catch {
          // handle error
        }
      },
    }),

    removeCartItem: builder.mutation<ClearCartResponse, string>({
      query: (productVariantId) => ({
        url: `/api/cart-items/${productVariantId}`,
        method: "DELETE",
      }),

      async onQueryStarted(productVariantId, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          dispatch(
            cartAPI.util.updateQueryData("getCartItems", undefined, (draft) => {
              draft.data = draft.data.filter(
                (item) => item.product_variant_id !== productVariantId,
              );
            }),
          );
        } catch {
          // Handle error if needed
        }
      },
    }),
  }),
});

export const {
  useGetCartItemsQuery,
  useAddToCartMutation,
  useClearCartMutation,
  useGetCartItemQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
} = cartAPI;
