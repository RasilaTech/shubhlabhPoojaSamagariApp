import baseQueryWithReauth from "@/api/baseQueryWithReauth";
import { createApi } from "@reduxjs/toolkit/query/react";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
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

    // Better approach: Handle the blob processing in transformResponse
    downloadInvoice: builder.mutation<{ success: boolean }, string>({
      query: (id: string) => ({
        url: `/api/orders/${id}/invoice`,
        method: "GET",
        responseType: "blob",
      }),
      transformResponse: async (response: Blob, meta, arg) => {
        try {
          if (!response) {
            throw new Error("Received empty response for invoice download.");
          }

          const blobToBase64 = (b: Blob): Promise<string> => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = reader.result?.toString().split(",")[1];
                if (base64) {
                  resolve(base64);
                } else {
                  reject(new Error("Failed to convert blob to base64."));
                }
              };
              reader.onerror = reject;
              reader.readAsDataURL(b);
            });
          };

          const base64Data = await blobToBase64(response);
          const fileUri = FileSystem.documentDirectory + `invoice_${arg}.pdf`;

          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
            Alert.alert(
              "Success",
              "Invoice downloaded and shared successfully."
            );
          } else {
            Alert.alert("Downloaded", `Invoice saved to: ${fileUri}`);
          }

          return { success: true };
        } catch (error) {
          console.error("Invoice download failed", error);
          Alert.alert("Error", "Invoice download failed. Please try again.");
          throw error;
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
