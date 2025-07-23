import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  CategoryResponse,
  GetCategoriesParams,
  GetCategoryByIdResponse,
} from "./categoryApi.type";
import axiosBaseQuery from "@/api/baseQuery";

export const categoryAPI = createApi({
  reducerPath: "categoryAPI",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryResponse, GetCategoriesParams>({
      query: ({
        page = 1,
        limit = 30,
        q,
        sort_by,
        sort_order,
      }: GetCategoriesParams) => ({
        url: "/api/categories",
        method: "GET",
        params: {
          page,
          limit,
          ...(q ? { q } : {}),
          ...(sort_by ? { sort_by } : {}),
          ...(sort_order ? { sort_order } : {}),
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

export const { useGetCategoriesQuery, useGetCategoryByIdQuery } = categoryAPI;
