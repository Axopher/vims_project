import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  // in order to be able to do this: import { useAuth } from "@/hooks/useAuth"; and others
  // we need alias in resolve as shown below
  resolve: {
    alias: {
      "@": "/src",
      "@features": "/src/features",
      "@services": "/src/services",
      "@utils": "/src/utils",
      "@ui": "/src/ui",
    },
  },
});
