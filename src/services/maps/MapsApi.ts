import axiosBaseQuery from "@/api/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  LatLng,
  MapsLatLngResponse,
  MapsSearchAddressResponse,
} from "./MapApi.type";

export const mapsAPI = createApi({
  reducerPath: "mapsAPI",
  baseQuery: axiosBaseQuery(),
  endpoints: (build) => ({
    getMapSearchResults: build.query<MapsSearchAddressResponse, string>({
      query: (q: string) => ({
        url: "api/maps/search",
        method: "GET",
        params: {
          q,
        },
      }),
    }),

    getAddressFromLatLng: build.query<MapsLatLngResponse, LatLng>({
      query: ({ lat, lng }) => ({
        url: "api/maps/location",
        method: "GET",
        params: {
          lat,
          lng,
          // automatically becomes ?search=Sultanwind road
        },
      }),
    }),
  }),
});

export const { useGetAddressFromLatLngQuery, useGetMapSearchResultsQuery } =
  mapsAPI;
