// src/pages/NotFoundPage.jsx
import { Link } from "react-router-dom";

export default function NotFoundPage({ role }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold text-gray-800">404 - Page Not Found</h1>
      <p className="mt-4 text-lg text-gray-600">
        The page you are looking for does not exist.
      </p>
      {role && (
        <p className="mt-2 text-md text-gray-500">
          Go back to your dashboard:&nbsp;
          <Link to={`/${role}`} className="text-blue-500 hover:underline">
            Click here
          </Link>
        </p>
      )}
    </div>
  );
}