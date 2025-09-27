// src/ui/FileInput.jsx
import { forwardRef, useState } from "react";

const FileInput = forwardRef(function FileInput(
  { label, name, accept = "image/*", disabled, error, onChange },
  ref
) {
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    setFileName(e.target.files?.[0]?.name || "");
    if (onChange) onChange(e);
  };

  return (
    <div className="space-y-1 w-full">

    {label && (
        <label htmlFor={label} className="block text-sm font-medium text-gray-700">
          Profile Photo
        </label>
      )}

      <div className="flex items-center gap-3">
        {/* Styled trigger */}
        <label
          htmlFor={name}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition
            ${disabled
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {label}
        </label>

        {/* Show selected file */}
        <span className="max-w-[14rem] truncate text-xs text-gray-600">
          {fileName || "No file selected"}
        </span>
      </div>

      {/* Hidden real input */}
      <input
        id={name}
        name={name}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        ref={ref}
        onChange={handleChange}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
)

export default FileInput