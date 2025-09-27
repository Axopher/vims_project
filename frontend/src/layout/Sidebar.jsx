// src/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { Landmark } from "lucide-react";

export default function Sidebar({ menuItems, role, tenant }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-sidebar shadow-lg lg:static">
      {/* Logo */}
      <NavLink
        to="/"
        className="flex flex-col items-center justify-center py-6"
      >
        {tenant?.logo ? (
          <img src={tenant.logo} alt="Tenant Logo" className="mb-2 h-12" />
        ) : (
          <Landmark className="mb-2 h-10 w-10 text-primary" />
        )}
        <h1 className="font-semibold text-gray-700">VIMS</h1>
      </NavLink>

      {/* Menu */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={`/${role}/${item.path}`}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out hover:bg-gray-100 hover:text-gray-900 ${isActive ? "bg-gray-200 text-gray-900" : "text-gray-700"}`
            }
          >
            {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
