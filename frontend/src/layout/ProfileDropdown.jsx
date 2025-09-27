// src/layout/ProfileDropdown.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
import LogoutButton from "../ui/LogoutButton";
import { Settings, UserRoundPen } from "lucide-react";

export default function ProfileDropdown({ user }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside); // This adds a mousedown event listener to the entire document.
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setOpen(!open)} className="flex items-center">
        <Avatar
          src={`https://ui-avatars.com/api/?name=${user?.email}`}
          size="sm"
        />
        {/* <span className="hidden text-sm font-medium text-gray-700 sm:inline">
          {user?.email}
        </span> */}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md border bg-white shadow-lg focus:outline-none">
          <div className="border-b px-4 py-2 text-sm font-medium text-gray-700">
            <p className="overflow-hidden text-ellipsis italic">
              {user?.email}
            </p>
          </div>
          <Link
            to=""
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
          >
            <UserRoundPen className="h-5 w-5 flex-shrink-0" />
            Profile
          </Link>
          <Link
            to=""
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            Settings
          </Link>
          <div className="border-t">
            <LogoutButton compact />
          </div>
        </div>
      )}
    </div>
  );
}
