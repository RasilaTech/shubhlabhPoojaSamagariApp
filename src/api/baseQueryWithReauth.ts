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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjZjU4MzYzMC04OWE0LTRiNGYtOGI4Ny01NDc3OWMxNmQ0M2QiLCJwaG9uZV9udW1iZXIiOiIrOTE5OTE0NDU0MTQ3Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzUzNzI0ODE4LCJleHAiOjE3NTUwMjA4MTh9.UELV5weEumGdp5fuWpIp4OYgPg10wRmunADBqq2Tpy00l3qDnUTqo1KuACGGeht9qG28ihwYo59fcDJN6oYjsztTdjaacnPeZNySyLpfgQeR-0wXrQ2pLyfIf_Tzk_fqjfrSESg8YNy5xd57-k4rpeeZvhd6ltZKbXnauCSAupkelZdWBdF3ycHNYC-R_4Z_Dg9NVaXYJh_gqovkK7k7i9BfMg1IuET7yK9Cjhb-6rqXTtUN2ictfeq8faDWxxY9dmfv2iHyuKsJKrbodh8EFtQCpt_1t797r6pRp4eH38ZHXwpjv6SSS-tiY2b1Sr8BqacTr1so9LC82BYtj_rpbg";

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
        "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjZjU4MzYzMC04OWE0LTRiNGYtOGI4Ny01NDc3OWMxNmQ0M2QiLCJwaG9uZV9udW1iZXIiOiIrOTE5OTE0NDU0MTQ3Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzUzNzI0ODE4LCJleHAiOjE3NTUwMjA4MTh9.UELV5weEumGdp5fuWpIp4OYgPg10wRmunADBqq2Tpy00l3qDnUTqo1KuACGGeht9qG28ihwYo59fcDJN6oYjsztTdjaacnPeZNySyLpfgQeR-0wXrQ2pLyfIf_Tzk_fqjfrSESg8YNy5xd57-k4rpeeZvhd6ltZKbXnauCSAupkelZdWBdF3ycHNYC-R_4Z_Dg9NVaXYJh_gqovkK7k7i9BfMg1IuET7yK9Cjhb-6rqXTtUN2ictfeq8faDWxxY9dmfv2iHyuKsJKrbodh8EFtQCpt_1t797r6pRp4eH38ZHXwpjv6SSS-tiY2b1Sr8BqacTr1so9LC82BYtj_rpbg";
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
