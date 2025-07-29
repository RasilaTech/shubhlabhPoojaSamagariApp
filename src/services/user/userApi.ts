import { createApi } from "@reduxjs/toolkit/query/react";
import type { UpdateEmail, UserDetails, UserResposne } from "./userApi.type";
import baseQueryWithReauth from "@/api/baseQueryWithReauth";

export const userAPI = createApi({
  reducerPath: "userAPI",
  baseQuery: baseQueryWithReauth,
  endpoints: (build) => ({
    getUserDetails: build.query<UserResposne, void>({
      query: () => ({ url: "api/users", method: "GET" }),
    }),

    updateUserDetails: build.mutation<UserResposne, UserDetails>({
      query: (body) => ({
        url: "/api/users",
        method: "PATCH",
        data: body,
      }),

      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;

          dispatch(
            userAPI.util.updateQueryData(
              "getUserDetails",
              undefined,
              (draft) => {
                draft.data = response.data;
              },
            ),
          );
        } catch {
          // Handle error if needed
        }
      },
    }),

    verifyEmail: build.mutation<UserResposne, UpdateEmail>({
      query: (body) => ({
        url: "api/users/email/otp",
        method: "POST",
        data: body,
      }),
    }),

    updateUserEmail: build.mutation<UserResposne, UpdateEmail>({
      query: (body) => ({
        url: "api/users/email",
        method: "PATCH",
        data: body,
      }),

      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;

          dispatch(
            userAPI.util.updateQueryData(
              "getUserDetails",
              undefined,
              (draft) => {
                draft.data = response.data;
              },
            ),
          );
        } catch {
          // Handle error if needed
        }
      },
    }),
  }),
});

export const {
  useGetUserDetailsQuery,
  useUpdateUserDetailsMutation,
  useUpdateUserEmailMutation,
  useVerifyEmailMutation,
} = userAPI;
