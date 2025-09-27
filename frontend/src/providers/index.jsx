// src/providers/index.jsx
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "../hooks/useAuth";

/**
 * QueryClient with sane defaults:
 * - staleTime: 60s (avoid refetching immediately)
 * - cacheTime: 5min (keeps cache for quick navigations)
 * - refetchOnWindowFocus: false to prevent unexpected refetch while user switches tabs
 * - retry: 1 to avoid infinite retry storms on transient errors
 *
 * Tweak these based on your API characteristics.
 */

const retryDecider = (failureCount, error) => {
  const status = error?.response?.status;

  // No response (network error / CORS / timeout):
  if (status == null) return failureCount < 2;

  // Retry some transient cases
  if (status === 408 || status === 429) return failureCount < 2;
  if (status >= 500) return failureCount < 2;

  // Don’t retry client errors (400–499), incl. 401/403/404
  return false;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 minute
      cacheTime: 5 * 60_000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: retryDecider,
    },
  },
});

export function Providers({ children }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <BrowserRouter>
          {children}
          {/* Global Toaster: centralized config so every page can call toast() */}
          <Toaster
            position="top-center"
            gutter={12}
            containerStyle={{ margin: "8px" }}
            toastOptions={{
              success: { duration: 3000 },
              error: { duration: 5000 },
              style: {
                fontSize: "16px",
                maxWidth: "500px",
                padding: "16px 24px",
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  );
}
