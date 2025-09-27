// src/pages/RoleDashboard.jsx
import { Suspense } from "react";
import {
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
} from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import Spinner from "../ui/Spinner";
import { getDefaultPathForRole, routesConfig } from "../config/routesConfig";
import ProtectedRoute from "../utils/ProtectedRoute";
import NotFoundPage from "./NotFoundPage";
import { userCanAccessRoute } from "../utils/permissionUtils";
import { useUser } from "../hooks/useUser";

/**
 * RoleDashboard:
 *  - Ensures :role matches logged-in user's role.
 *  - Builds route list & menu items from routesConfig but filtered by current user's permissions.
 */
export default function RoleDashboard() {
  const { role } = useParams();
  const location = useLocation();
  const { data: user } = useUser();
  
  if (!user) return <Navigate to="/login" replace />;

  const normalized = role.toLowerCase();
  const userRole = (user.role || "").toLowerCase();

  // Guard: if role prefix doesn't match the logged-in user's role, redirect to user's dashboard
  if (normalized !== userRole) {
    const target = `/${userRole}/${getDefaultPathForRole(userRole)}`;
    if (location.pathname !== target) {
      return <Navigate to={target} replace />;
    }
  }

  // Build routes accessible to this user (NOT only role)
  const accessibleRoutes = Object.values(routesConfig).filter((rt) =>
    userCanAccessRoute(user, rt),
  );

  const defaultPath = getDefaultPathForRole(normalized);
  const menuItems = accessibleRoutes
    .filter((r) => r.label)
    .map((r) => ({
      label: r.label,
      path: r.path,
      icon: r.icon,
    }));

  return (
    <DashboardLayout role={userRole} menuItems={menuItems}>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <Routes>
          {/* Default → first accessible route */}
          <Route index element={<Navigate to={defaultPath} replace />} />

          {accessibleRoutes.map((rt) => {
            const Comp = rt.component;
            const allowedRoles = rt.allowedRoles || ["*"];
            const permissions = rt.permissions || [];
            return (
              <Route
                key={rt.path}
                path={rt.path}
                element={
                  <ProtectedRoute
                    allowedRoles={allowedRoles}
                    permissions={permissions}
                  >
                    <Comp />
                  </ProtectedRoute>
                }
              />
            );
          })}

          {/* Unknown nested path -> NotFound within role */}
          <Route path="*" element={<NotFoundPage role={normalized} />} />
        </Routes>
      </Suspense>
    </DashboardLayout>
  );
}
