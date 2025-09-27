// src/utils/permissionUtils.js

/**
 * Does user have required roles + permissions?
 *
 * Important:
 *  - Role and permission checks are case-insensitive.
 *  - Missing arrays or nulls are handled safely.
 */
export function canUserAccess(user, { roles = [], permissions = [] } = {}) {
  if (!user) return false;

  const role = (user.role || "").toLowerCase();

  // Normalize roles input to lowercase
  const allowedRoles = (roles || []).map((r) => (r || "").toLowerCase());
  const roleOk =
    allowedRoles.length === 0 ||
    allowedRoles.includes("*") ||
    allowedRoles.includes(role);

  const userPerms = (user.ui_permissions || []).map((p) =>
    typeof p === "string" ? p.toLowerCase() : p,
  );
  const requiredPerms = (permissions || []).map((p) =>
    typeof p === "string" ? p.toLowerCase() : p,
  );

  const permsOk =
    requiredPerms.length === 0 ||
    requiredPerms.every((p) => userPerms.includes(p));

  return roleOk && permsOk;
}

/**
 * Route-specific check.
 *
 * `route` may be either:
 *  - the route object from routesConfig OR
 *  - an object { allowedRoles, permissions }.
 */
export function userCanAccessRoute(user, routeOrOpts) {
  if (!routeOrOpts) return false;

  // route could be the entire route object (with allowedRoles, permissions)
  if (routeOrOpts.allowedRoles || routeOrOpts.permissions) {
    return canUserAccess(user, {
      roles: routeOrOpts.allowedRoles || [],
      permissions: routeOrOpts.permissions || [],
    });
  }

  // else assume it's { allowedRoles, permissions }
  return canUserAccess(user, routeOrOpts);
}

/**
 * Single permission check (case-insensitive).
 */
export function hasPermission(user, perm) {
  if (!user || !perm) return false;
  return (user.ui_permissions || [])
    .map((p) => (typeof p === "string" ? p.toLowerCase() : p))
    .includes(perm.toLowerCase());
}
