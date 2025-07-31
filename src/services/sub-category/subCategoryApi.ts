import axiosBaseQuery from "@/api/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  SubCategoryPageParam,
  SubCategoryRequestQueryParams,
  SubCategoryResponse,
} from "./subCategoryAPI.type";

export const subCategoryAPI = createApi({
  reducerPath: "subCategoryAPI",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    getSubCategories: builder.infiniteQuery<
      SubCategoryResponse,
      SubCategoryRequestQueryParams,
      SubCategoryPageParam
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
        url: "/api/sub-categories",
        method: "GET",
        params: {
          page: pageParam,
          limit: queryArg.limit || 30,
          parent_ids: queryArg.parent_ids,
          ...(queryArg.q ? { q: queryArg.q } : {}),
          ...(queryArg.sort_by ? { sort_by: queryArg.sort_by } : {}),
          ...(queryArg.sort_order ? { sort_order: queryArg.sort_order } : {}),
        },
      }),
    }),
  }),
});

export const { useGetSubCategoriesInfiniteQuery } = subCategoryAPI;
