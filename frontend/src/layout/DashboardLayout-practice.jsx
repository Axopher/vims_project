// src/layout/DashboardLayout.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LogoutButton from "../ui/LogoutButton";

export default function DashboardLayout({ children, menuItems, role }) {
  const { auth } = useAuth();

  return (
    <div className="flex h-screen bg-black">
      {/* left column */}
      <aside className="w-64 bg-white">
        {/* Header */}
        {/* Navigation */}
        {/* Footer */}
      </aside>

      {/* right column */}
      <div className="flex min-w-0 flex-1 flex-col bg-yellow-200">
        {/* Topbar */}
        <header className="h-16 bg-blue-400">fsfs</header>

        {/* Content area */}
        <main className="flex min-w-0 flex-1 flex-col bg-gray-700">
          <div className="flex min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-auto">
            <h1>
              very long very long
              sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
            </h1>
          </div>
        </main>
      </div>
    </div>
  );
}
