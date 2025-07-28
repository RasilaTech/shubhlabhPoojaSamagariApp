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
  // let accessToken = getAuthState().auth.accessToken;
  let accessToken =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjZjU4MzYzMC04OWE0LTRiNGYtOGI4Ny01NDc3OWMxNmQ0M2QiLCJwaG9uZV9udW1iZXIiOiIrOTE5OTE0NDU0MTQ3Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzUzNzIzMTQxLCJleHAiOjE3NTM3MjQwNDF9.DTPZlu14eve5RgVEo-4MNCN33VjV5bSqBs0-zY-e2fRx4HKto2q7z3jwuKlZ4uJ9Ajx66vV-yppx0HTjmILJV4BKKcQ91-IMNa-b86VFvOB65v_pQk7NKTCEwDR3EJ1A8AwGKd0lHzdvROByMgSTLPOk8OeBgygJFsftZpeBzKpzP7hfUQbKQk0uSKhX431PPR4ZnuwBepm9IKWgub1KMQccdN0r1oJWZfBESLnUN2JjrqS6Sg3AfzNfajPDckeJFQ_DCX9STXWsXC_cZx3nvnBQYyLQynQr6OrW4z_eEzU8hJyuzaDuBRWzUuUMEpke1ZpkTVUxrOuePnrl-Ud54A";

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
      // accessToken = getAuthState().auth.accessToken;
      accessToken =
        "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjZjU4MzYzMC04OWE0LTRiNGYtOGI4Ny01NDc3OWMxNmQ0M2QiLCJwaG9uZV9udW1iZXIiOiIrOTE5OTE0NDU0MTQ3Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzUzNzIzMTQxLCJleHAiOjE3NTM3MjQwNDF9.DTPZlu14eve5RgVEo-4MNCN33VjV5bSqBs0-zY-e2fRx4HKto2q7z3jwuKlZ4uJ9Ajx66vV-yppx0HTjmILJV4BKKcQ91-IMNa-b86VFvOB65v_pQk7NKTCEwDR3EJ1A8AwGKd0lHzdvROByMgSTLPOk8OeBgygJFsftZpeBzKpzP7hfUQbKQk0uSKhX431PPR4ZnuwBepm9IKWgub1KMQccdN0r1oJWZfBESLnUN2JjrqS6Sg3AfzNfajPDckeJFQ_DCX9STXWsXC_cZx3nvnBQYyLQynQr6OrW4z_eEzU8hJyuzaDuBRWzUuUMEpke1ZpkTVUxrOuePnrl-Ud54A";
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
