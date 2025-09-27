// vims_project/frontend/src/features/employees/EmployeeTable.jsx
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SearchBox from "../../ui/SearchBox";
import Pagination from "../../ui/Pagination";
import Table from "../../ui/Table";
import EmployeeForm from "./EmployeeForm";
import {
  getEmployees,
  createEmployee,
  deleteEmployee,
  updateEmployee,
} from "../../services/apiEmployee";
import { toast } from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";
import ConfirmDialog from "../../ui/ConfirmDialog";
import Avatar from "../../ui/Avatar";
import StatusBadge from "../../ui/StatusBadge";
import { Edit, Trash2, Eye } from "lucide-react";
import IconButton from "../../ui/IconButton";
import CanAccessUI from "../../ui/CanAccessUI";

export default function EmployeeTable({ isModalFormOpen, setIsModalFormOpen }) {
  const [query, setQuery] = useState("");
  const [editData, setEditData] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [deleteId, setDeleteId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const queryClient = useQueryClient();

  // read page from URL (default 1)
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const [page, setPage] = useState(pageFromUrl);

  // keep state & URL in sync
  useEffect(() => {
    setSearchParams({ page }); // update URL when page changes
  }, [page, setSearchParams]);

  const { data, isPending, error } = useQuery({
    queryKey: ["employees", page, query],
    queryFn: () => getEmployees({ page, search: query }),
    keepPreviousData: true,
  });

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  const { mutateAsync: addEmployee } = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      toast.success("Employee created successfully");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      handleFormClose();
    },
    onError: (err) => toast.error(err.message || "Failed to create employee"),
  });

  const { mutateAsync: editEmployee } = useMutation({
    mutationFn: updateEmployee,
    onSuccess: () => {
      toast.success("Employee updated successfully");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      handleFormClose();
    },
    onError: (err) => toast.error(err.message || "Failed to update employee"),
  });

  const { mutateAsync: removeEmployee, isPending: isDeleting } = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      toast.success("Employee deleted");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsConfirmOpen(false);
    },
    onError: (err) => toast.error(err.message || "Failed to delete employee"),
  });

  const confirmDelete = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (deleteId) removeEmployee(deleteId);
  };

  const openEdit = (emp) => {
    const flattened = {
      ...emp,
      email: emp.user?.email,
      gender: emp.user?.gender,
      role: emp.user?.role,
      photo_url: emp.photo || "", // for preview in edit mode
    };
    delete flattened.user; // Clean up the original nested user object
    setEditData(flattened);
    setIsModalFormOpen(true);
  };

  const handleFormClose = () => {
    setIsModalFormOpen(false);
    setEditData(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editData) {
        await editEmployee({ id: editData.idx, data: formData });
      } else {
        await addEmployee(formData);
      }
    } catch (err) {
      // console.error("Form submit failed:", err);
    }
  };

  // Display the specific error message from our interceptor
  if (error) {
    return (
      <div
        className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:text-red-400"
        role="alert"
      >
        <h1 className="font-medium">Oops! Something went wrong.</h1>
        <p>{error.message}</p>
      </div>
    );
  }
  const { data: employees = [], total_pages = 1 } = data || {};

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-tr-xl border-b border-gray-100 bg-gray-50 px-6 py-4">
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Search employees..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto p-6">
        <Table
          columns={[
            {
              header: "Name",
              accessor: "name", // A virtual accessor
              render: (row) => (
                <div className="flex items-center gap-3">
                  <Avatar src={row.photo} alt={row.first_name} size="sm" />
                  <div className="font-medium text-gray-900">
                    {`${row.first_name} ${row.family_name}`}
                  </div>
                </div>
              ),
            },
            {
              header: "Email",
              accessor: "user.email",
            },
            // {
            //   header: "Title",
            //   accessor: "title", // A virtual accessor
            //   render: (row) => (
            //     <div>
            //       <div className="text-gray-900">{row.department}</div>{" "}
            //       {/* Assuming you have a department field */}
            //       <div className="text-gray-500">{row.position}</div>{" "}
            //       {/* Assuming you have a position field */}
            //     </div>
            //   ),
            // },
            { header: "Code", accessor: "code" },
            { header: "Role", accessor: "user.role" },
            {
              header: "Status",
              accessor: "is_active",
              render: (row) => <StatusBadge isActive={row.is_active} />,
            },
            {
              header: <span className="sr-only">Actions</span>,
              accessor: "actions",
              render: (row) => (
                <div className="flex justify-end gap-1">
                  <CanAccessUI permissions={["employee:view"]}>
                    <IconButton
                      variant="link"
                      as={Link}
                      to={`${row.idx}?page=${page}`}
                      state={{
                        breadcrumbTitle: `${row.first_name} ${row.family_name}`,
                      }}
                      title="Details"
                    >
                      <Eye className="h-4 w-4" />
                    </IconButton>
                  </CanAccessUI>

                  <CanAccessUI permissions={["employee:edit"]}>
                    <IconButton
                      variant="ghost"
                      onClick={() => openEdit(row)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </IconButton>
                  </CanAccessUI>

                  <CanAccessUI permissions={["employee:delete"]}>
                    <IconButton
                      variant="danger"
                      onClick={() => confirmDelete(row.idx)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </CanAccessUI>
                </div>
              ),
            },
          ]}
          data={employees}
          isLoading={isPending}
        />

        {/* Pagination placed below the table, right aligned */}
        <div className="mt-4 flex justify-end">
          <Pagination
            page={page}
            totalPages={total_pages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        isLoading={isDeleting}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
      />

      {/* Create/Edit modal */}
      <EmployeeForm
        key={editData?.idx || "create"}
        isOpen={isModalFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        defaultValues={editData || undefined}
      />
    </div>
  );
}
