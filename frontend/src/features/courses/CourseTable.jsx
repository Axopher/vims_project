// src/features/courses/CourseTable.jsx
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import SearchBox from "../../ui/SearchBox";
import Pagination from "../../ui/Pagination";
import Table from "../../ui/Table";
import ConfirmDialog from "../../ui/ConfirmDialog";

import CourseForm from "./CourseForm";

import {
  useCourses,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
} from "./useCourses";
import IconButton from "../../ui/IconButton";
import { Edit, Eye, Trash2 } from "lucide-react";

export default function CourseTable({ isModalFormOpen, setIsModalFormOpen }) {
  const [query, setQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const [page, setPage] = useState(pageFromUrl);

  useEffect(() => {
    setSearchParams({ page });
  }, [page, setSearchParams]);

  const pageSize = 5;
  const { data, isFetching, error } = useCourses({
    page,
    page_size: pageSize,
    search: query,
  });

  // list envelope: { data: [...], total_pages, current_page, page_size, total_records }
  const courses = data?.data || [];
  const total_pages = data?.total_pages || 1;

  // mutations (hooks already invalidate ["courses"] on success)
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  // modal/edit/delete state
  const [editData, setEditData] = useState(null);
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (error) {
      // show friendly toast for list load failures (Employee shows inline alert too)
      toast.error(error.message || "Failed to load courses");
    }
  }, [error]);

  const openEdit = (row) => {
    setEditData(row);
    setIsModalFormOpen(true);
  };

  const handleFormClose = () => {
    setIsModalFormOpen(false);
    setEditData(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editData?.idx) {
        await updateCourse.mutateAsync({ idx: editData.idx, data: formData });
        toast.success("Course updated");
      } else {
        await createCourse.mutateAsync(formData);
        toast.success("Course created");
      }
      setIsModalFormOpen(false);
    } catch (err) {
      // error messages are already handled by hooks' onError if configured,
      // keep this here as fallback
      toast.error(err?.message || "Failed to save course");
    }
  };

  const confirmDelete = (idx) => {
    setDeleteIdx(idx);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteCourse.mutateAsync(deleteIdx);
      toast.success("Course deleted");
      setIsConfirmOpen(false);
      setDeleteIdx(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete course");
    }
  };

  // Show top-level error block like EmployeeTable
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
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-tr-xl border-b border-gray-100 bg-gray-50 px-6 py-4">
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <SearchBox
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search courses..."
          />
        </div>
      </div>

      <div className="p-6">
        <Table
          columns={[
            { header: "Code", accessor: "code" },
            { header: "Name", accessor: "name" },
            { header: "Description", accessor: "description" },
            {
              header: <span className="sr-only">Actions</span>,
              accessor: "actions",
              render: (row) => (
                <div className="flex items-center justify-end gap-2">
                  {/* link to course detail, preserve page param */}
                  <IconButton
                    variant="link"
                    as={Link}
                    to={`${row.idx}?page=${page}`}
                    title="Details"
                    state={{ breadcrumbTitle: `${row.name}` }}
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
          data={courses}
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
        isLoading={deleteCourse.isPending}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
      />

      <CourseForm
        key={editData?.idx || "create"}
        isOpen={isModalFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        isLoading={createCourse.isPending || updateCourse.isPending}
        defaultValues={editData || undefined}
      />
    </div>
  );
}
