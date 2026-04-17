const fallbackApiBaseUrl = "https://backend-hackathon-production-faa2.up.railway.app";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? fallbackApiBaseUrl).replace(/\/$/, "");

export const API_BASE_URL = apiBaseUrl;
export const API_URL = `${apiBaseUrl}/api`;

export const AUTH_LOGIN_URL = `${API_URL}/auth/login`;
export const AUTH_ME_URL = `${API_URL}/auth/me`;
export const AUTH_LOGOUT_URL = `${API_URL}/auth/logout`;
