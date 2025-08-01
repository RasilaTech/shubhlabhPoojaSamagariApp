import baseQueryWithReauth from "@/api/baseQueryWithReauth";
import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  CreateUserAddressPayload,
  UpdateUserAddressPayload,
  UserAddressListResponse,
  UserAddressResponse,
} from "./addressApi.type";

export const addressAPI = createApi({
  reducerPath: "addressAPI",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Address"],
  endpoints: (builder) => ({
    getUserAddressList: builder.query<UserAddressListResponse, void>({
      query: () => ({
        url: `/api/addresses/`,
        method: "GET",
      }),
      providesTags: [{ type: "Address", id: "LIST" }],
    }),

    addUserAddress: builder.mutation<
      UserAddressResponse,
      CreateUserAddressPayload
    >({
      query: (body) => ({
        url: "/api/addresses/",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "Address", id: "LIST" }],
    }),

    updateUserAddress: builder.mutation<
      UserAddressResponse,
      { addressId: string; body: UpdateUserAddressPayload }
    >({
      query: ({ addressId, body }) => ({
        url: `/api/addresses/${addressId}`,
        method: "PATCH",
        data: body,
      }),

      invalidatesTags: [{ type: "Address", id: "LIST" }],
    }),

    deleteAddress: builder.mutation<UserAddressResponse, string>({
      query: (addressId) => ({
        url: `/api/addresses/${addressId}`,
        method: "DELETE",
      }),

      invalidatesTags: [{ type: "Address", id: "LIST" }],
    }),
  }),
});

export const {
  useGetUserAddressListQuery,
  useAddUserAddressMutation,
  useUpdateUserAddressMutation,
  useDeleteAddressMutation,
} = addressAPI;
