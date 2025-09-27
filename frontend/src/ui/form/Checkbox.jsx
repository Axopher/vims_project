// src/ui/form/Checkbox.jsx
import { forwardRef } from "react";

const Checkbox = forwardRef(
  ({ id, name, className = "", label, ...props }, ref) => {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          id={id || name}
          name={name}
          type="checkbox"
          className={`h-4 w-4 rounded border focus:ring-2 ${className}`}
          {...props}
        />
        {label && (
          <label htmlFor={id || name} className="text-sm text-gray-700">
            {label}
          </label>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
export default Checkbox;
