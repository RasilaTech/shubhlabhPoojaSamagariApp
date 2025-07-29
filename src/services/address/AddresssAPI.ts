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
  endpoints: (builder) => ({
    getUserAddressList: builder.query<UserAddressListResponse, void>({
      query: () => ({
        url: `/api/addresses/`,
        method: "GET",
      }),
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

      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;

          dispatch(
            addressAPI.util.updateQueryData(
              "getUserAddressList",
              undefined,
              (draft) => {
                draft.data.push(response.data);
              }
            )
          );
        } catch {
          // Handle error if needed
        }
      },
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

      async onQueryStarted({ addressId }, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;

          dispatch(
            addressAPI.util.updateQueryData(
              "getUserAddressList",
              undefined,
              (draft) => {
                if (!response.data) {
                  draft.data = draft.data.filter(
                    (item) => item.id !== addressId
                  );
                  return;
                }
                const itemIndex = draft.data.findIndex(
                  (item) => item.id === response.data?.id
                );

                if (itemIndex !== -1) {
                  draft.data[itemIndex] = response.data;
                }
              }
            )
          );
        } catch {
          // Handle error if needed
        }
      },
    }),

    deleteAddress: builder.mutation<UserAddressResponse, string>({
      query: (addressId) => ({
        url: `/api/addresses/${addressId}`,
        method: "DELETE",
      }),

      async onQueryStarted(addressId, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          dispatch(
            addressAPI.util.updateQueryData(
              "getUserAddressList",
              undefined,
              (draft) => {
                draft.data = draft.data.filter((item) => item.id !== addressId);
              }
            )
          );
        } catch {
          // Handle error if needed
        }
      },
    }),
  }),
});

export const {
  useGetUserAddressListQuery,
  useAddUserAddressMutation,
  useUpdateUserAddressMutation,
  useDeleteAddressMutation,
} = addressAPI;
