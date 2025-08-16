import baseQueryWithReauth from "@/api/baseQueryWithReauth";
import { createApi } from "@reduxjs/toolkit/query/react";
import { CreateUserDevicePayload, UserDeviceResponse } from "./deviceApi.type";

export const deviceAPI = createApi({
  reducerPath: "deviceAPI",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    addUserDevice: builder.mutation<
      UserDeviceResponse,
      CreateUserDevicePayload
    >({
      query: (body) => ({
        url: "/api/devices/",
        method: "POST",
        data: body,
      }),
    }),
  }),
});

export const { useAddUserDeviceMutation } = deviceAPI;
