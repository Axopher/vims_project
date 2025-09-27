// To get deep nested value like, {"user": {"avatar": "profile.png"}} user.avatar
export const getNestedValue = (row, accessor) => {
  return accessor.split(".").reduce((obj, key) => obj?.[key], row);
};

// A small helper function to check if the value is a File object
export const isFile = (value) => value instanceof File;

export function formatDateISO(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
