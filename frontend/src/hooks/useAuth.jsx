// vims_project/frontend/src/hooks/useAuth.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getTenantFromUrl } from "../utils/getTenant";
import { clearCred, setCred, getCred } from "../services/tokenStorage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const tenantName = getTenantFromUrl();
  const [auth, setAuth] = useState(() => getCred());

  const login = (tokens) => {
    setAuth(tokens);
    setCred(tokens);
  };

  const logout = () => {
    setAuth(null);
    clearCred();
  };

  // Handle tenant theme from backend (auth.tenant.theme)
  useEffect(() => {
    if (auth?.tenant?.theme) {
      // Backend-provided theme overrides
      for (const [key, value] of Object.entries(auth.tenant.theme)) {
        document.documentElement.style.setProperty(`--color-${key}`, value);
      }
    } else {
      // Fallback: set to default or tenantName-based theme
      document.documentElement.setAttribute(
        "data-theme",
        tenantName || "default",
      );
    }
  }, [auth?.tenant, tenantName]);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
