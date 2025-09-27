// src/utils/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUser } from "../hooks/useUser";
import { userCanAccessRoute } from "./permissionUtils";

/**
 * ProtectedRoute
 *
 * Usage:
 *  - Auth-only guard:
 *      <ProtectedRoute><Child /></ProtectedRoute>
 *  - Role/permission guard:
 *      <ProtectedRoute allowedRoles={['director']} permissions={['employee:edit']}>
 *        <Child />
 *      </ProtectedRoute>
 *
 * Props:
 *  - allowedRoles?: string[] (lowercase). Empty/omitted = auth-only mode. ["*"] = all roles.
 *  - permissions?: string[] (optional). User must have ALL to pass.
 *  - fallback?: string (redirect target when unauthorized).
 *
 * Behavior:
 *  - If not authenticated → /login (with `from` state).
 *  - If roles mismatch → fallback (default = /:role/unauthorized).
 *  - If missing permissions → fallback.
 *  - If already on fallback path → avoid loops (render nothing).
 */
export default function ProtectedRoute({
  children,
  allowedRoles = [],
  permissions = [],
  fallback = "/unauthorized",
}) {
  const { auth } = useAuth();
  const { data: user, isPending, isError } = useUser();
  const location = useLocation();

  // 1) No token => not logged in
  if (!auth?.access) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2) User object not loaded or errored or pending → don't render yet
  if (!user || isPending || isError) return null; // 🔹 App.jsx ensures we don’t hit this in a bad state

  // old way is below
  // Token present but user fetch failed or returned no user => force login
  // if (!user || isError) {
  //   // We can't validate permissions without a user object. Best to ask user to re-auth.
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  // Permission/role checks
  const opts = { allowedRoles, permissions };
  const allowed = userCanAccessRoute(user, opts);

  if (!allowed) {
    // default unauthorized path is role-aware: "/student/unauthorized" etc.
    const userRole = (user.role || "").toLowerCase();
    const target = fallback || `/${userRole}/unauthorized`;

    // avoid infinite redirect loop (if we’re already there)
    if (location.pathname.toLowerCase() === target.toLowerCase()) {
      return null;
    }
    return <Navigate to={target} replace />;
  }

  // All Checks Passed
  return children;
}
