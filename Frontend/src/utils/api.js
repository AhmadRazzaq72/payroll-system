const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4500";

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export const apiUrl = (path) => {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};
