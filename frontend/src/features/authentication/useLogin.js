// src/features/auth/useLogin.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login as loginApi } from "../../services/apiAuth";
import { useAuth } from "../../hooks/useAuth";

export function useLogin() {
  const { login: setAuthCredentials } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: login, isPending: isLoggingIn } = useMutation({
    mutationFn: ({ email, password }) => loginApi({ email, password }),
    // variables is the object { email, password, redirectTo: from } that was passed to the mutate function.
    onSuccess: async (tokens, variables) => {
      // variables is received from onSubmit in LoginPage.jsx
      try {
        // 1. Save tokens
        setAuthCredentials(tokens);

        // 2. Invalidate + refetch user profile
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        await queryClient.refetchQueries({ queryKey: ["user"] });

        // 3. Navigate only after profile is ready
        // 👇 Use `variables.redirectTo` if provided, else "/"
        const redirectTo = variables?.redirectTo || "/";
        navigate(redirectTo, { replace: true });

        toast.success("Logged in successfully!");
      } catch (err) {
        // console.error("Failed to load user profile after login:", err);
        toast.error(err.message || "Could not load user profile.");
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { login, isLoggingIn };
}
