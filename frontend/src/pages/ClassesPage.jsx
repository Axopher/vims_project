// src/pages/ClassesPage.jsx
// import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import CourseClassesTable from "../features/courses/CourseClassesTable";
import Button from "../ui/Button";
import { Plus } from "lucide-react";

export default function ClassesPage() {
  // const [searchParams] = useSearchParams();
  // const courseIdx = searchParams.get("course_idx");
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);

  return (
    // Full height responsive layout without unnecessary global scrolls
    <div className="min-h-screen w-full space-y-6 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
      {/* Header section */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">
            Classes
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the classes for courses offered in your organization.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button
            className="flex items-center gap-2"
            onClick={() => setIsModalFormOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Class
          </Button>
        </div>
      </div>

      {/* Employee Table inside scrollable wrapper */}
      <CourseClassesTable
        isModalFormOpen={isModalFormOpen}
        setIsModalFormOpen={setIsModalFormOpen}
        // courseIdx={courseIdx}
      />
    </div>
  );
}
