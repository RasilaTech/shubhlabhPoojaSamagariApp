import baseQueryWithReauth from "@/api/baseQueryWithReauth";
import type { CouponResponse } from "./couponApi.type";
import { createApi } from "@reduxjs/toolkit/query/react";

export const couponAPI = createApi({
  reducerPath: "couponAPI",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getCoupons: builder.query<CouponResponse, void>({
      query: () => ({
        url: "/api/coupons",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetCouponsQuery } = couponAPI;
