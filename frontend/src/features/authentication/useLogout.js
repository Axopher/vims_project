// src/features/auth/useLogout.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout: logoutFromContext } = useAuth();

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: async () => {
      // In your current setup, logout is a client-side only operation.
      // If you implement an API endpoint for logout, you would call it here.
      // e.g., await logoutApi();
      logoutFromContext();
    },
    onSuccess: () => {
      // Clear all cached data to ensure a clean state for the next user.
      queryClient.clear();
      navigate("/login", { replace: true });
      toast.success("Logged out successfully!");
    },
    onError: (err) => {
      // Although unlikely to fail in its current form, this is good practice.
      toast.error(err.message || "Logout failed. Please try again.");
    },
  });

  return { logout, isLoggingOut };
}