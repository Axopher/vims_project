import { X } from "lucide-react"; // Import the cross icon

export default function InstructorBadge({ name, onUnassign, ariaLabel }) {
  return (
    <div className="inline-flex items-center gap-x-1.5 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200">
      <span className="max-w-[180px] truncate">{name}</span>
      <button
        onClick={onUnassign}
        className="group relative -mr-1 h-3.5 w-3.5 items-center justify-center rounded-sm text-red-600 hover:bg-red-200"
        aria-label={ariaLabel}
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    </div>
  );
}
