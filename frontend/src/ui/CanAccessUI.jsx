// src/ui/CanAccessUI.jsx
import { useUser } from "../hooks/useUser";
import { canUserAccess } from "../utils/permissionUtils";

export default function CanAccessUI({
  roles = [],
  permissions = [],
  children,
}) {
  const { data: user, isPending } = useUser();
  if (isPending) return null;

  if (!canUserAccess(user, { roles, permissions })) return null;

  return <>{children}</>;
}
