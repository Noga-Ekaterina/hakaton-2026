import { API_URL } from "@/shared/config/api";

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession() {
  refreshPromise ??= fetch(`${API_URL}/auth/refresh`, {
    credentials: "include",
    method: "POST",
  }).then((response) => response.ok);

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function fetchWithAuthRefresh(input: RequestInfo | URL, init?: RequestInit) {
  let response = await fetch(input, {
    ...init,
    credentials: init?.credentials ?? "include",
  });

  if (response.status === 401 && (await refreshSession())) {
    response = await fetch(input, {
      ...init,
      credentials: init?.credentials ?? "include",
    });
  }

  return response;
}
