import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  CategoryResponse,
  GetCategoriesParams,
  GetCategoryByIdResponse,
  ProductPageParam,
} from "./categoryApi.type";
import axiosBaseQuery from "@/api/baseQuery";

export const categoryApi = createApi({
  reducerPath: "categoryAPI",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    getCategories: builder.infiniteQuery<
      CategoryResponse,
      GetCategoriesParams,
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
        url: "/api/categories",
        method: "GET",
        params: {
          page: pageParam,
          limit: queryArg.limit || 30,
          ...(queryArg.q ? { q: queryArg.q } : {}),
          ...(queryArg.sort_by ? { sort_by: queryArg.sort_by } : {}),
          ...(queryArg.sort_order ? { sort_order: queryArg.sort_order } : {}),
        },
      }),
    }),

    getCategoryById: builder.query<GetCategoryByIdResponse, string>({
      query: (id: string) => ({
        url: `/api/categories/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetCategoriesInfiniteQuery, useGetCategoryByIdQuery } = categoryApi;
