import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "../ui/Button";
import EnrollmentTable from "../features/students/EnrollmentTable";

export default function EnrollmentsPage() {
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);

  return (
    <div className="min-h-screen w-full space-y-6 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
      {/* Header section */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">
            Enrollments
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the student enrolled on various course classes in your
            organization.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Button
              className="flex items-center gap-2"
              onClick={() => setIsModalFormOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Enrollment
            </Button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <EnrollmentTable
          isModalFormOpen={isModalFormOpen}
          setIsModalFormOpen={setIsModalFormOpen}
        />
      </div>
    </div>
  );
}
