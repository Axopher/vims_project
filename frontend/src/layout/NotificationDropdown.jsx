// src/layout/NotificationDropdown.jsx
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setOpen(!open)} className="relative flex items-center justify-center h-full">
        <Bell className="h-6 w-6 text-gray-600" />
        {/* static red dot for now */}
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border bg-white shadow-lg">
          <div className="p-3 text-sm font-medium">Notifications</div>
          <ul className="divide-y">
            <li className="p-3 text-sm text-gray-600">
              No new notifications
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
