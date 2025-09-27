// src/utils/PublicRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { getDefaultPathForRole } from "../config/routesConfig";
import { useUser } from "../hooks/useUser";
import { useAuth } from "../hooks/useAuth";

/**
 * PublicRoute
 *
 * Used for public pages (login, register, forgot password).
 * - If user is logged in → redirect to their default dashboard.
 * - If still loading user profile → wait until it's ready.
 */
export default function PublicRoute({ children }) {
  const { auth } = useAuth();
  const { data: user, isPending } = useUser();
  const location = useLocation();

  // If logged in and user profile is ready => redirect to role dashboard
  if (auth?.access && user && !isPending) {
    const role = (user.role || "").toLowerCase();
    const defaultPath = getDefaultPathForRole(role);
    const target = `/${role}/${defaultPath}`;

    // avoid useless re-navigation if already on target
    if (location.pathname.toLowerCase() !== target.toLowerCase()) {
      return <Navigate to={target} replace state={{ from: location }} />;
    }
  }

  // Otherwise, render the public page (login, etc.)
  return children;
}
