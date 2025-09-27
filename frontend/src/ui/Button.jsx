// vims_project/frontend/src/ui/Button.jsx
export default function Button({
  isLoading,
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}) {
  const widthClass = fullWidth ? "w-full" : "";

  // Base styles are now independent of size
  const base = `rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${widthClass}`;

  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${base} ${styles[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {children}
    </button>
  );
}
