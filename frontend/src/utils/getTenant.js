// vims_project/frontend/src/utils/getTenant.js
export function getTenantFromUrl() {
  const host = window.location.hostname;
  const parts = host.split(".");
  return parts[0]; // tenant1.example.com -> tenant1
}
