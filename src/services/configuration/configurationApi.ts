import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "@/api/baseQuery";
import { ConfigurationResponse } from "./configurationApi.type";

export const configurationApi = createApi({
  reducerPath: "configurationAPI",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    getAppConfigurations: builder.query<ConfigurationResponse, void>({
      query: () => ({
        url: `/api/configurations/`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetAppConfigurationsQuery } = configurationApi;
