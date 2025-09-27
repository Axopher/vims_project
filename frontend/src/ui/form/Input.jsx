// src/ui/form/Input.jsx
import { forwardRef } from "react";

const Input = forwardRef(
  ({ type = "text", id, name, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        id={id || name}
        name={name}
        type={type}
        className={`w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${className}`}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export default Input;
