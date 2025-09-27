// vims_project/frontend/src/pages/CoursePage.jsx
import { useState } from "react";
import { Plus } from "lucide-react";
import CourseTable from "../features/courses/CourseTable";
import Button from "../ui/Button";
import CanAccessUI from "../ui/CanAccessUI";

export default function CoursesPage() {
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  return (
    // Full height responsive layout without unnecessary global scrolls
    <div className="min-h-screen w-full space-y-6 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
      {/* Header section */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">
            Courses
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the courses in your organization.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <CanAccessUI permissions={["course:create"]}>
            <Button
              className="flex items-center gap-2"
              onClick={() => setIsModalFormOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Course
            </Button>
          </CanAccessUI>
        </div>
      </div>

      {/* Course Table inside scrollable wrapper */}
      <div className="w-full overflow-x-auto">
        <CourseTable
          isModalFormOpen={isModalFormOpen}
          setIsModalFormOpen={setIsModalFormOpen}
        />
      </div>
    </div>
  );
}
