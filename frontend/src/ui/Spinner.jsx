// src/ui/Spinner.jsx
export default function Spinner({ size = "md", color = "primary" }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-4",
  };

  const colors = {
    primary: "border-blue-600",
    white: "border-white",
    gray: "border-gray-500",
  };

  const baseColor = "border-gray-300"

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} ${baseColor} ${colors[color]} rounded-full border-t-transparent animate-spin`}
        role="status"
        aria-label="loading"
      />
    </div>
  );
}