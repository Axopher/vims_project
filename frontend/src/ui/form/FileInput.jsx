// src/ui/form/FileInput.jsx
import { forwardRef, useState } from "react";

const FileInput = forwardRef(({ id, name, accept = "image/*", disabled, onChange }, ref) => {
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    setFileName(e.target.files?.[0]?.name || "");
    if (onChange) onChange(e); // call parent's onChange (e.g., react-hook-form)
  };

  return (
    <div className="flex items-center gap-3">
      {/* Trigger */}
      <label
        htmlFor={id || name}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition
          ${disabled
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        Upload
      </label>

      {/* File name */}
      <span className="max-w-[14rem] truncate text-xs text-gray-600">
        {fileName || "No file selected"}
      </span>

      {/* Hidden real input */}
      <input
        ref={ref}
        id={id || name}
        name={name}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={handleChange}
      />
    </div>
  );
});

FileInput.displayName = "FileInput";

export default FileInput;
