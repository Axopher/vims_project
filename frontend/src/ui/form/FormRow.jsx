// src/ui/form/FormRow.jsx
import { cloneElement } from "react";

export default function FormRow({ label, error, children }) {
  const childId = children?.props?.id || children?.props?.name;

  // clone child to add error styles
  const childWithError = cloneElement(children, {
    className: `
      ${children.props.className || ""}
      ${
        error
          ? "border-red-500 focus:ring-red-500"
          : "border-gray-300 focus:ring-blue-500"
      }
    `.trim(),
  });

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={childId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {childWithError}

      {error && (
        <span className="text-xs text-red-600">
          {typeof error === "string" ? error : error.message}
        </span>
      )}
    </div>
  );
}
