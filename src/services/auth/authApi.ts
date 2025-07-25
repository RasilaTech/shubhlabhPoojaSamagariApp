import axiosBaseQuery from "@/api/baseQuery";
import {
  type AuthResponse,
  type OtpResponse,
  type RequestOtpRequest,
  type VerifyOtpRequest,
} from "./authApi.type";
import { logout, setCredentials } from "@/store/features/auth/authSlice";
import { createApi } from "@reduxjs/toolkit/query/react";

export const authAPI = createApi({
  reducerPath: "authAPI",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    requestOtp: builder.mutation<OtpResponse, RequestOtpRequest>({
      query: (data) => ({
        url: "/auth/otp",
        method: "POST",
        data,
      }),
    }),

    verifyOtp: builder.mutation<AuthResponse, VerifyOtpRequest>({
      query: (data) => ({
        url: "/auth/verify",
        method: "POST",
        data,
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              access_token: data.data.access_token,
              refresh_token: data.data.refresh_token,
            })
          );
        } catch {
          // Handle error if needed
        }
      },
    }),

    refreshToken: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              access_token: data.data.access_token,
              refresh_token: data.data.refresh_token,
            })
          );
        } catch {
          dispatch(logout());
        }
      },
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch {
          dispatch(logout());
        }
      },
    }),
  }),
});

export const {
  useLogoutMutation,
  useRefreshTokenMutation,
  useVerifyOtpMutation,
  useRequestOtpMutation,
} = authAPI;
