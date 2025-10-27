const inDevMode = import.meta.env.VITE_ENV === "dev";

export const API_BASE_URL = inDevMode
  ? import.meta.env.VITE_DEV_BE_BASE_URL
  : import.meta.env.VITE_PROD_BE_BASE_URL;

export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  VERIFY: "/auth/verify",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  LOGOUT: "/auth/logout",
};

export const API_DEFAULTS = {
  max_retries: 3,
  delay: 2000,
  timeout: 15000,
};

export const CACHE_DEFAULTS = {
  ...API_DEFAULTS,
  ttl: 5 * 60 * 1000, // 5 minutes default TTL,
  maxSize: 100, // Maximum number of items in cache
  cleanupInterval: 60 * 1000, // 1 minute
  debug: process.env.NODE_ENV === "dev",
  key_prefix: "jamendo_",
};
