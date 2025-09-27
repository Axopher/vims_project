// src/ui/form/Textarea.jsx
import { forwardRef } from "react";

const Textarea = forwardRef(
  ({ id, name, rows = 4, className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        id={id || name}
        name={name}
        rows={rows}
        className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${className}`}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
export default Textarea;
