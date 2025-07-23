import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  GetProductsParams,
  ProductResponse,
  ProductPageParam,
  SingleProductResponse,
} from "./productApi.type";
import axiosBaseQuery from "@/api/baseQuery";

export const productAPI = createApi({
  reducerPath: "productAPI",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    getProducts: builder.infiniteQuery<
      ProductResponse,
      GetProductsParams,
      ProductPageParam
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
        url: "/api/products",
        method: "GET",
        params: {
          page: pageParam,
          limit: queryArg.limit || 30,
          ...(queryArg.category_id
            ? { category_id: queryArg.category_id }
            : {}),
          ...(queryArg.q ? { q: queryArg.q } : {}),
          ...(queryArg.brand_name ? { brand_name: queryArg.brand_name } : {}),
          ...(queryArg.price_min ? { price_min: queryArg.price_min } : {}),
          ...(queryArg.price_max ? { price_max: queryArg.price_max } : {}),
        },
      }),
    }),
    getProductById: builder.query<SingleProductResponse, string>({
      query: (id: string) => ({
        url: `/api/products/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetProductsInfiniteQuery, useGetProductByIdQuery } =
  productAPI;
