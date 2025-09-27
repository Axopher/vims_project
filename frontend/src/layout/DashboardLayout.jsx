// src/layout/DashboardLayout.jsx
import Sidebar from "./Sidebar";
import Header from "./Header";
import { getTenantFromUrl } from "../utils/getTenant";
import { useState } from "react";
import { useUser } from "../hooks/useUser";
import Breadcrumbs from "../ui/BreadCrumbs";

/**
 * DashboardLayout — master layout for all tenant dashboards.
 */
export default function DashboardLayout({ children, menuItems, role }) {
  const { data: user } = useUser();
  const tenantName = getTenantFromUrl();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="flex h-screen bg-gray-100"
      data-theme={tenantName || "default"}
    >
      {/* Sidebar (mobile) */}
      <div className="lg:hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-500 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar menuItems={menuItems} role={role} tenant={tenantName} />
        </div>
      </div>

      {/* Sidebar (desktop, static, no fixed) */}
      <div className="hidden lg:flex">
        <Sidebar menuItems={menuItems} role={role} tenant={tenantName} />
      </div>

      {/* Main content */}
      <div className="flex h-screen flex-1 flex-col overflow-hidden lg:h-auto">
        {/* Topbar */}
        <Header
          tenant={tenantName}
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          {/* Page-level header: breadcrumbs on left, you can add page actions on right */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex-1">
              <Breadcrumbs />
            </div>
            {/* placeholder for page actions if needed */}
            <div className="ml-4 flex-shrink-0" />
          </div>

          {/* actual page content */}
          {children}
        </main>
      </div>
    </div>
  );
}
