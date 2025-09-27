// vims_project/frontend/src/pages/EmployeesPage.jsx
import { useState } from "react";
import { Plus } from "lucide-react";
import EmployeeTable from "../features/employees/EmployeeTable";
import Button from "../ui/Button"; // Make sure Button is imported
import CanAccessUI from "../ui/CanAccessUI";

export default function EmployeesPage() {
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);

  return (
    // Full height responsive layout without unnecessary global scrolls
    <div className="min-h-screen w-full space-y-6 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
      {/* Header section */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">
            Employees
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the employees in your organization.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <CanAccessUI permissions={["employee:create"]}>
            <Button
              className="flex items-center gap-2"
              onClick={() => setIsModalFormOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </CanAccessUI>
        </div>
      </div>

      {/* Employee Table inside scrollable wrapper */}
      <EmployeeTable
        isModalFormOpen={isModalFormOpen}
        setIsModalFormOpen={setIsModalFormOpen}
      />
    </div>
  );
}
