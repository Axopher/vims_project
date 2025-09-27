// src/ui/IconButton.jsx
export default function IconButton({
  isLoading,
  children,
  variant = "ghost",
  as: Component = "button",
  ...props
}) {
  const styles = {
    ghost: "text-gray-500 hover:bg-gray-100",
    danger: "text-red-600 hover:bg-red-50",
    link: "text-blue-600 hover:bg-blue-50",
  };

  return (
    <Component
      className={`rounded-full p-2 transition-colors duration-200 ${styles[variant]}`}
      disabled={isLoading}
      {...props}
    >
      {children}
    </Component>
  );
}
