import axios, { AxiosError, AxiosInstance } from "axios";
import { getSession, signIn } from "next-auth/react";
import { ApiError } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const MAX_GET_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 400;

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: process.env.NODE_ENV === "development" ? 0 : 30000,
});

axiosInstance.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.idToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${session.idToken}`;
  }
  return config;
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: string }>) => {
    const config = error.config as
      | (typeof error.config & { __retryCount?: number })
      | undefined;

    const isNetworkError = !error.response;
    const isGet = (config?.method || "get").toLowerCase() === "get";

    if (isNetworkError && isGet && config) {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < MAX_GET_RETRIES) {
        config.__retryCount += 1;
        await sleep(RETRY_BASE_DELAY_MS * config.__retryCount);
        return axiosInstance(config);
      }
    }

    const status = error.response?.status ?? 0;

    if (status === 401) {
      // Force re-login — the id_token is missing/expired/invalid.
      await signIn("google");
    }

    const message =
      error.response?.data?.error || error.message || "Request failed";
    return Promise.reject(new ApiError(message, status));
  },
);
