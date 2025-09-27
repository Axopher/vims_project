// src/ui/LogoutButton.jsx
import { LogOut } from "lucide-react";
import { useLogout } from "../features/authentication/useLogout";

export default function LogoutButton({ compact = false }) {
  const { logout, isLoggingOut } = useLogout();

  if (compact) {
    // Ghost style for sidebar
    return (
      <button
        onClick={logout}
        disabled={isLoggingOut}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="h-5 w-5 flex-shrink-0" />
        <span>Logout</span>
      </button>
    );
  }

  // Default button for dropdown
  return (
    <button
      onClick={logout}
      disabled={isLoggingOut}
      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
    >
      Logout
    </button>
  );
}
