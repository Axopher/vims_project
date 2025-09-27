// src/pages/NotAuthorizedPage.jsx

export default function NotAuthorizedPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <h1 className="mb-2 text-2xl font-bold text-red-600">Access Denied</h1>
      <p className="text-gray-600">
        You don’t have permission to access this area.
      </p>
    </div>
  );
}
