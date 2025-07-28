import baseQueryWithReauth from "@/api/baseQueryWithReauth";
import { createApi } from "@reduxjs/toolkit/query/react";
// import { cartAPI } from "../cart/cartAPI";
import type {
  CancelOrderPayload,
  CreateOrders,
  getOrdersParams,
  getOrdersResponse,
  OrderByIdResponse,
  OrderCancelResponse,
  orderPageParam,
  OrderResponse,
  RazorpayPaymentResponse,
  VerifyRazorpayPaymentResponse,
} from "./orderApi.type";

export const orderApi = createApi({
  reducerPath: "orderAPI",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Order", "OrdersList"],
  endpoints: (builder) => ({
    getOrders: builder.infiniteQuery<
      getOrdersResponse,
      getOrdersParams,
      orderPageParam
    >({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
          if (lastPage.meta.currentPage >= lastPage.meta.totalPages) {
            return undefined;
          }
          return lastPageParam + 1;
        },
      },
      query: ({ queryArg, pageParam }) => ({
        url: "/api/orders",
        method: "GET",
        params: {
          page: pageParam,
          limit: queryArg.limit || 30,
        },
      }),
      providesTags: (result) => {
        const listTag = { type: "OrdersList" as const, id: "LIST" };
        if (result?.pages) {
          const orderTags = result.pages.flatMap((page) =>
            page.data.map((order) => ({
              type: "Order" as const,
              id: order.id,
            }))
          );
          return [...orderTags, listTag];
        }
        return [listTag];
      },
    }),

    getOrderById: builder.query<OrderByIdResponse, string>({
      query: (id: string) => ({
        url: `api/orders/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),

    createOrder: builder.mutation<OrderResponse, CreateOrders>({
      query: (body) => ({
        url: `/api/orders/`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "OrdersList", id: "LIST" }],
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          //dispatch(cartAPI.util.invalidateTags([{ type: "cartItems" }]));
        } catch {
          // Handle error if needed
        }
      },
    }),

    verifyPayment: builder.mutation<
      VerifyRazorpayPaymentResponse,
      RazorpayPaymentResponse
    >({
      query: (body) => ({
        url: `/api/orders/payment-verification`,
        method: "POST",
        data: body,
      }),
    }),

    cancelOrder: builder.mutation<
      OrderCancelResponse,
      { id: string; body: CancelOrderPayload }
    >({
      query: ({ id, body }) => ({
        url: `/api/orders/${id}/cancel`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Order", id },
        { type: "OrdersList", id: "LIST" },
      ],
    }),

    downloadInvoice: builder.mutation<Blob, string>({
      query: (id: string) => ({
        url: `/api/orders/${id}/invoice`,
        method: "GET",
        responseType: "blob",
      }),

      async onQueryStarted(id, { queryFulfilled }) {
        try {
          const blob = await queryFulfilled;

          const url = URL.createObjectURL(blob.data);
          const link = document.createElement("a");
          link.href = url;
          link.download = `invoice_${id}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error("Invoice download failed", error);
        }
      },
    }),
  }),
});

export const {
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useGetOrdersInfiniteQuery,
  useCancelOrderMutation,
  useDownloadInvoiceMutation,
} = orderApi;
