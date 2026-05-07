import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/shared/config/api";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
});

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(api: Parameters<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>>[1]) {
  refreshPromise ??= (async () => {
    const result = await rawBaseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
      },
      api,
      {},
    );

    return !result.error;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export const baseQueryWithAuthRefresh: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) {
    return result;
  }

  const refreshed = await refreshSession(api);

  if (refreshed) {
    result = await rawBaseQuery(args, api, extraOptions);
  } else {
    api.dispatch({ type: "auth/clearAuth" });
  }

  return result;
};
