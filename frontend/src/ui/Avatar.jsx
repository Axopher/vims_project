// src/ui/Avatar.jsx
import { UserRound } from "lucide-react";

export default function Avatar({
  src,
  alt = "User avatar",
  size = "md", // "sm" | "md" | "lg" | custom px
  className = "",
}) {
  const sizeMap = {
    sm: "h-12 w-12",
    md: "h-24 w-24",
    lg: "h-48 w-48",
    xl: "h-64 w-64",
  };

  const appliedSize = sizeMap[size] || size;
  const getIconSize = () => {
    switch (size) {
      case "sm":
        return 24;
      case "md":
        return 32;
      case "lg":
        return 48;
      case "xl":
        return 64;
      default:
        return 32;
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-full bg-gray-200 ring-1 ring-black/10 ${appliedSize} ${className}`}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <UserRound
            size={getIconSize()}
            strokeWidth={1.5}
            className="text-gray-500"
          />
        </div>
      )}
    </div>
  );
}

// usages:
//  <Avatar src={row.photo} alt={row.first_name} size="sm" />
// <Avatar src={preview} size="lg" />
