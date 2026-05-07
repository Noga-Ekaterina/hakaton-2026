import { accessTokenCookieName, refreshTokenCookieName } from "../constants.js";

export const accessTokenMaxAgeMs = 1000 * 60 * 5;
export const refreshTokenMaxAgeMs = 1000 * 60 * 60 * 24 * 7;

export const accessTokenCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/api",
  maxAge: accessTokenMaxAgeMs,
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/api/auth",
  maxAge: refreshTokenMaxAgeMs,
};

export { accessTokenCookieName, refreshTokenCookieName };
