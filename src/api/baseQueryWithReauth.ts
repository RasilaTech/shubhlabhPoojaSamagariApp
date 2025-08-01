import { logout, setCredentials } from "@/store/features/auth/authSlice";
import type { RootState } from "@/store/store";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { Mutex } from "async-mutex";
import type { AxiosError, AxiosRequestConfig } from "axios";
import axiosInstance from "./axiosInstance";

const mutex = new Mutex();

const baseQueryWithReauth: BaseQueryFn<
  {
    url: string;
    method: AxiosRequestConfig["method"];
    data?: AxiosRequestConfig["data"];
    params?: AxiosRequestConfig["params"];
    headers?: AxiosRequestConfig["headers"];
  },
  unknown,
  unknown
> = async (args, api, _extraOptions) => {
  await mutex.waitForUnlock();

  const getAuthState = () => api.getState() as RootState;
  let accessToken = getAuthState().auth.accessToken;

  let headers = {
    ...args.headers,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined),
  };

  try {
    const result = await axiosInstance({ ...args, headers });
    return { data: result.data };
  } catch (axiosError) {
    const err = axiosError as AxiosError;
    const status = err.response?.status;

    if (status !== 401) {
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }

    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshToken = getAuthState().auth.refreshToken;
        if (!refreshToken) {
          api.dispatch(logout());
          return { error: { status: 401, data: "Session expired." } };
        }

        const refreshResult = await axiosInstance.post("/auth/refresh", {
          refreshToken,
        });

        if (refreshResult.data) {
          const newTokens = refreshResult.data as {
            accessToken: string;
            refreshToken: string;
          };
          api.dispatch(
            setCredentials({
              access_token: newTokens.accessToken,
              refresh_token: newTokens.refreshToken,
            })
          );

          headers["Authorization"] = `Bearer ${newTokens.accessToken}`;
          const retryResult = await axiosInstance({ ...args, headers });
          return { data: retryResult.data };
        } else {
          api.dispatch(logout());
          return { error: { status: 401, data: "Session expired." } };
        }
      } catch {
        api.dispatch(logout());
        return { error: { status: 401, data: "Session expired." } };
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      accessToken = getAuthState().auth.accessToken;
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
        const retryResult = await axiosInstance({ ...args, headers });
        return { data: retryResult.data };
      } else {
        return { error: { status: 401, data: "Session expired." } };
      }
    }
  }
};

export default baseQueryWithReauth;
