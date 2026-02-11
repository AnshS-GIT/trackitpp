import axios from "axios";
import { logout } from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

import eventBus from "../utils/eventBus";

// ... existing code ...

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "An unexpected error occurred";
    let type = "error";

    // Check if toast should be suppressed
    if (error.config?.suppressToast) {
      return Promise.reject(error);
    }

    if (error.response) {
      const { status, data } = error.response;
      message = data?.message || message;
      // Use "error" type by default, but consider "warning" for 401 maybe? Kept "error" for consistency.

      if (status === 401) {
        // Special handling for Login endpoint - DO NOT treat as session expiration
        if (error.config.url.includes("/login")) {
           // For login, we might want to let the component handle it (invalid credentials).
           // But if we are here, suppressToast was false.
           // So we show the message from backend "Invalid credentials" as a toast?
           // Or just generic "Session expired" logic is wrong here.
           // Let's assume if it's login, we just show the backend message.
        } else {
           message = "Session expired. Please log in again.";
           logout();
        }
      } else if (status === 403) {
        message = "Access denied. You do not have permission.";
      } else if (status === 500) {
        message = "Server error. Please try again later.";
      }
    } else if (error.request) {
      message = "Network error. Please check your connection.";
    }

    // Emit event to show toast
    eventBus.dispatch("SHOW_TOAST", { message, type });

    return Promise.reject(error);
  }
);

export default api;
