// vims/frontend/src/App.jsx
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./utils/ProtectedRoute";
import PublicRoute from "./utils/PublicRoute";
import Spinner from "./ui/Spinner";
import { useAuth } from "./hooks/useAuth";
import { useUser } from "./hooks/useUser";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const ActivationPage = lazy(() => import("./pages/ActivationPage"));
const RoleDashboard = lazy(() => import("./pages/RoleDashboard"));

export default function App() {
  const { auth } = useAuth();
  const { isPending } = useUser();

  // 🔹 Bootstrap gate: while we have a token but user not loaded, block everything
  if (auth?.access && isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <Routes>
        {/* Public routes */}
        <Route
          path="/activate"
          element={
            <PublicRoute>
              <ActivationPage />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Outer auth guard: only logged in users can reach any /:role/* pages.
            This is 'auth-only' mode (no allowedRoles prop). */}
        <Route
          path="/:role/*"
          element={
            <ProtectedRoute>
              <RoleDashboard />
            </ProtectedRoute>
          }
        />

        {/* Root / and unknown routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
