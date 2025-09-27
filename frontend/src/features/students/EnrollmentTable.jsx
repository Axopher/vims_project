import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

import SearchBox from "../../ui/SearchBox";
import Pagination from "../../ui/Pagination";
import Table from "../../ui/Table";

import EnrollmentForm from "./EnrollmentForm";
import {
  useCreateEnrollment,
  useEnrollments,
  // useDeleteEnrollment,
  // useUpdateEnrollment,
} from "./useStudents";
import Avatar from "../../ui/Avatar";
import { formatDateISO } from "../../utils/helpers";

export default function EnrollmentTable({
  isModalFormOpen,
  setIsModalFormOpen,
}) {
  const [query, setQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const [page, setPage] = useState(pageFromUrl);

  // for edit flow
  const [editRow, setEditRow] = useState(null);

  useEffect(() => {
    setSearchParams({ page });
  }, [page, setSearchParams]);

  const pageSize = 10;
  const { data, isFetching, error } = useEnrollments({
    page,
    page_size: pageSize,
    search: query,
  });

  const enrollments = data?.data || [];
  const total_pages = data?.total_pages || 1;

  // mutations
  const createEnrollment = useCreateEnrollment();
  // const updateEnrollment = useUpdateEnrollment();
  // const deleteEnrollment = useDeleteEnrollment();

  useEffect(() => {
    if (error) toast.error(error.message || "Failed to load enrollments");
  }, [error]);

  const handleFormClose = () => {
    setIsModalFormOpen(false);
    setEditRow(null);
  };

  const handleFormSubmit = async (formData) => {
    // formData: { student_idx, course_class_idx, status, comment }
    try {
      // if (editRow) {
      //   // update flow
      //   await updateEnrollment.mutateAsync({
      //     idx: editRow.idx,
      //     data: formData,
      //   });
      //   toast.success("Enrollment updated");
      // } else {
      // create flow
      await createEnrollment.mutateAsync(formData);
      // }
      setIsModalFormOpen(false);
      setEditRow(null);
    } catch (err) {
      // mutation onError handlers will show toast; keep local fallback
      toast.error(err?.message || "Failed to save enrollment");
    }
  };

  // const handleEdit = (row) => {
  //   setEditRow(row);
  //   setIsModalFormOpen(true);
  // };

  // const handleCloseEnrollment = async (row) => {
  //   const ok = window.confirm(
  //     `Are you sure you want to close enrollment for ${row.student.first_name} ${row.student.family_name}?`,
  //   );
  //   if (!ok) return;
  //   try {
  //     await deleteEnrollment.mutateAsync({
  //       idx: row.idx,
  //       student_idx: row.student.idx,
  //     });
  //     toast.success("Enrollment closed");
  //   } catch (err) {
  //     toast.error(err?.message || "Failed to close enrollment");
  //   }
  // };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Search header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-tr-xl border-b border-gray-100 bg-gray-50 px-6 py-4">
        <SearchBox
          value={query}
          onChange={(v) => {
            setQuery(v);
            setPage(1);
          }}
          placeholder="Search students..."
        />
      </div>

      <div className="p-6">
        <Table
          columns={[
            {
              header: "Name",
              // virtual accessor - show avatar + full name
              render: (row) => (
                <div className="flex items-center gap-3">
                  <Avatar
                    src={row.student.photo}
                    alt={row.student.first_name}
                    size="sm"
                  />
                  <div className="font-medium text-gray-900">
                    {`${row.student.first_name} ${row.student.family_name}`}
                  </div>
                </div>
              ),
            },
            { header: "Phone", accessor: "student.phone" },
            { header: "Gender", accessor: "student.gender" },
            { header: "DOB", render: (row) => formatDateISO(row.student.dob) },
            {
              header: "Course Class",
              render: (row) =>
                row.course_class
                  ? `${row.course_class.code} — ${row.course_class.course?.name || ""}`
                  : "-",
            },
            { header: "Status", accessor: "status" },
            { header: "Comment", accessor: "comment" },
            // {
            //   header: "Actions",
            //   render: (row) => (
            //     <div className="flex gap-2">
            //       <button
            //         className="text-sm text-blue-600 hover:underline"
            //         onClick={() => handleEdit(row)}
            //       >
            //         Edit
            //       </button>
            //       <button
            //         className="text-sm text-red-600 hover:underline"
            //         onClick={() => handleCloseEnrollment(row)}
            //       >
            //         Close
            //       </button>
            //     </div>
            //   ),
            // },
          ]}
          data={enrollments}
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

      <EnrollmentForm
        key={editRow ? `edit-${editRow.idx}` : "create"}
        isOpen={isModalFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        defaultValues={
          editRow
            ? {
                student_idx: editRow.student.idx,
                course_class_idx: editRow.course_class?.idx || "",
                status: editRow.status?.toUpperCase?.() || "enquired",
                comment: editRow.comment || "",
              }
            : undefined
        }
        isLoading={createEnrollment.isLoading} // || updateEnrollment.isLoading
      />
    </div>
  );
}
