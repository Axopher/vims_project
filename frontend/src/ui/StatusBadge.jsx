// src/ui/StatusBadge.jsx
export default function StatusBadge({ isActive }) {
  const activeClasses = "bg-green-50 text-green-700 ring-green-200";
  const inactiveClasses = "bg-gray-100 text-gray-600 ring-gray-200";

  return (
    <div
      className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium ${
        isActive ? activeClasses : inactiveClasses
      }`}
    >
      <span>{isActive ? "Active" : "Inactive"}</span>
    </div>
  );
}
