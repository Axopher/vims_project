// src/ui/form/Select.jsx
import { forwardRef } from "react";

const Select = forwardRef(
  ({ id, name, options = [], className = "", ...props }, ref) => {
    return (
      <select
        ref={ref}
        id={id || name}
        name={name}
        className={`w-full rounded-lg border bg-white px-3 py-2 focus:outline-none focus:ring-2 ${className}`}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  },
);

Select.displayName = "Select";

export default Select;
