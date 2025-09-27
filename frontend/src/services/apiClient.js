// src/services/apiClient.js
import axios from "axios";
import { getTenantFromUrl } from "../utils/getTenant";
import { getCred, setCred, clearCred } from "./tokenStorage";
import { refreshToken } from "./apiAuth";

const API_BASE_DOMAIN = import.meta.env.VITE_API_BASE_DOMAIN;

const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  // timeout: 10000,
});

// Request Interceptor: Attaches the JWT token to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const tenant = getTenantFromUrl();
  config.baseURL = `http://${tenant}.${API_BASE_DOMAIN}/api`;

  const creds = getCred();
  if (creds && creds.access) {
    config.headers.Authorization = `Bearer ${creds.access}`;
  }
  return config;
});

// --- Token refresh queue ---
let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    // --- 1. HANDLE REQUEST CANCELLATION (GRACEFUL SILENCE) ---
    // This is not a real error, so we don't want to show a toast.
    if (axios.isCancel(error)) {
      // FIX: Silently reject the promise so the calling code knows the request was cancelled.
      return Promise.reject(error);
    }

    // --- 2. HANDLE NETWORK ERRORS ---
    if (!error.response) {
      // You can even be more specific about timeouts if you want
      if (error.code === "ECONNABORTED") {
        throw new Error("Connection timed out. Please try again.");
      }

      // FIX: Check if the browser thinks it's online.
      if (navigator.onLine) {
        // If the browser is online, it's likely a server issue (down, CORS, etc.)
        throw new Error(
          "The server is not responding. Please try again later.",
        );
      } else {
        // If the browser is offline, it's a user connectivity issue.
        throw new Error(
          "You are offline. Please check your internet connection.",
        );
      }
    }

    // --- 3. SPECIFIC TOKEN REFRESH LOGIC ---
    const originalRequest = error.config;
    if (
      error.response.status === 401 &&
      error.response.data?.code === "token_not_valid" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const { refresh, ...rest } = getCred();
      if (!refresh) {
        clearCred();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        const { access, refresh: newRefresh } = await refreshToken(refresh);
        console.log("User Old Data", rest);
        const newAuth = { ...rest, access, refresh: newRefresh || refresh };
        setCred(newAuth);

        apiClient.defaults.headers.Authorization = `Bearer ${access}`;
        processQueue(null, access);
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return apiClient(originalRequest);
      } catch (err) {
        // FIX: Properly handle errors from the refreshTokenAPI call itself.
        processQueue(err, null);
        clearCred();
        window.location.href = "/login";

        return Promise.reject(
          err.response
            ? new Error("Your session has expired. Please log in again.")
            : new Error("Connection failed. Please log in again."),
        );
      } finally {
        isRefreshing = false;
      }
    }

    // --- 4. GENERAL ERROR HANDLING (FOR ALL OTHER SERVER ERRORS) ---
    const responseData = error.response?.data;
    // a) Try to get a specific message from the server's response
    let friendlyMessage =
      // DRF standard for general errors
      responseData?.detail ||
      // Common alternative for single-field messages
      responseData?.message;

    // b) If no specific message, check for DRF-style field errors
    if (!friendlyMessage && responseData && typeof responseData === "object") {
      // Collect first error from the dict
      const firstKey = Object.keys(responseData)[0];
      const firstVal = responseData[firstKey];

      if (Array.isArray(firstVal)) {
        // Example: { code: ["employee with this code already exists."] }
        friendlyMessage = firstVal[0];
      } else if (typeof firstVal === "string") {
        // Example: { code: "employee with this code already exists." }
        friendlyMessage = firstVal;
      }
    }

    // c) Still nothing? Use status-code based fallback
    if (!friendlyMessage) {
      if (error.response.status === 404) {
        friendlyMessage = "The item you were looking for could not be found.";
      } else if (error.response.status >= 500) {
        friendlyMessage =
          "Our servers are experiencing issues. Please try again later.";
      } else {
        friendlyMessage = error.message || "An unexpected error occurred.";
      }
    }

    // Console log the developer-friendly details
    if (import.meta.env.DEV) {
      console.error("API Error:", {
        message: friendlyMessage,
        status: error.response?.status,
        url: originalRequest.url,
        serverData: responseData,
      });
    }

    // Attach the chosen message to the error object for use in components and toasts
    error.message = friendlyMessage;

    // Rethrow the original error so err.response still exists
    return Promise.reject(error);
  },
);

export default apiClient;
