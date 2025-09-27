// src/layout/Header.jsx
import { Menu, Landmark } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";

export default function Header({ user, onMenuClick }) {
  return (
    <header className="flex h-20 items-center justify-between border-b bg-white px-4 shadow-sm">
      {/* Mobile menu button */}
      <button
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </button>

      <div>
        {/* <h1 className="font-semibold text-gray-700">
        {user?.name || "Dashboard"}
      </h1> */}
        {/* <Landmark /> */}
      </div>

      {/* Right side (user profile, notifications, etc) */}
      <div className="flex items-center gap-7 mr-9">
        <NotificationDropdown />
        <ProfileDropdown user={user} />
      </div>
    </header>
  );
}
