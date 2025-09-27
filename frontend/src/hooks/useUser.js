// src/hooks/useUser.js
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../services/apiUser";
import { useAuth } from "./useAuth";

export function useUser() {
  const { auth } = useAuth();
  return useQuery({
    queryKey: ["user"],
    queryFn: getMe,
    enabled: !!auth?.access, // ⬅️ don't call /me if no token
    staleTime: 60_000,
  });
}
