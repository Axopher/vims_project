// src/features/students/StudentTable.jsx
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Eye, Edit, Trash2 } from "lucide-react";

import SearchBox from "../../ui/SearchBox";
import Pagination from "../../ui/Pagination";
import Table from "../../ui/Table";
import ConfirmDialog from "../../ui/ConfirmDialog";
import IconButton from "../../ui/IconButton";
import Avatar from "../../ui/Avatar";

import StudentForm from "./StudentForm";
import {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
} from "./useStudents";

export default function StudentTable({ isModalFormOpen, setIsModalFormOpen }) {
  const [query, setQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const [page, setPage] = useState(pageFromUrl);

  // keep URL in sync
  useEffect(() => {
    setSearchParams({ page });
  }, [page, setSearchParams]);

  const pageSize = 5;
  const { data, isFetching, error } = useStudents({
    page,
    page_size: pageSize,
    search: query,
  });

  const students = data?.data || [];
  const total_pages = data?.total_pages || 1;

  // mutations
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const [editData, setEditData] = useState(null);
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (error) toast.error(error.message || "Failed to load students");
  }, [error]);

  const openEdit = (row) => {
    const studentData = { ...row, photo_url: row.photo || "" };
    setEditData(studentData);
    setIsModalFormOpen(true);
  };

  const handleFormClose = () => {
    setIsModalFormOpen(false);
    setEditData(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editData?.idx) {
        await updateStudent.mutateAsync({ idx: editData.idx, data: formData });
        toast.success("Student updated");
      } else {
        await createStudent.mutateAsync(formData);
        toast.success("Student created");
      }
      setIsModalFormOpen(false);
    } catch (error) {
      toast.error(error?.message || "Failed to save student");
    }
  };

  const confirmDelete = (idx) => {
    setDeleteIdx(idx);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteStudent.mutateAsync(deleteIdx);
      toast.success("Student deleted");
      setIsConfirmOpen(false);
      setDeleteIdx(null);
    } catch (error) {
      toast.error(error?.message || "Failed to delete student");
    }
  };

  if (error) {
    return (
      <div
        className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800"
        role="alert"
      >
        <h1 className="font-medium">Oops! Something went wrong.</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-tr-xl border-b border-gray-100 bg-gray-50 px-6 py-4">
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <SearchBox
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search students..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto p-6">
        <Table
          columns={[
            {
              header: "Name",
              accessor: "name",
              render: (row) => (
                <div className="flex items-center gap-3">
                  <Avatar src={row.photo} alt={row.first_name} size="sm" />
                  <div className="font-medium text-gray-900">
                    {`${row.first_name} ${row.family_name}`}
                  </div>
                </div>
              ),
            },
            { header: "Email", accessor: "email" },
            { header: "Phone", accessor: "phone" },
            { header: "Date of Birth", accessor: "dob" },
            { header: "Gender", accessor: "gender" },
            {
              header: <span className="sr-only">Actions</span>,
              accessor: "actions",
              render: (row) => (
                <div className="flex justify-end gap-1">
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

                  <IconButton
                    variant="ghost"
                    onClick={() => openEdit(row)}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </IconButton>

                  <IconButton
                    variant="danger"
                    onClick={() => confirmDelete(row.idx)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              ),
            },
          ]}
          data={students}
          isLoading={isFetching}
        />

        <div className="mt-4 flex justify-end">
          <Pagination
            page={page}
            totalPages={total_pages}
            onPageChange={setPage}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteStudent.isPending}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
      />

      <StudentForm
        key={editData?.idx || "create"}
        isOpen={isModalFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        isLoading={createStudent.isPending || updateStudent.isPending}
        defaultValues={editData || undefined}
      />
    </div>
  );
}
