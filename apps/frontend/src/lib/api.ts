import { getToken } from "./auth";

const API_BASE_URL = "http://127.0.0.1:8000";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  // Set Content-Type only if it's not already set (e.g. by FormData)
  if (!headers.has("Content-Type") && !(options.body instanceof FormData) && typeof options.body === "string") {
      headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `API request failed with status ${response.status}`);
  }

  return response.json();
};
