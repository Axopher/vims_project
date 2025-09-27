// src/features/courses/CourseClassesTable.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import SearchBox from "../../ui/SearchBox";
import Pagination from "../../ui/Pagination";
import Table from "../../ui/Table";
import ConfirmDialog from "../../ui/ConfirmDialog";
import IconButton from "../../ui/IconButton";

import CourseClassForm from "./CourseClassForm";
import AssignInstructorModal from "./AssignInstructorModal";

import {
  useCourseClasses,
  useCreateCourseClass,
  useUpdateCourseClass,
  useDeleteCourseClass,
  useUnassignInstructor,
} from "./useCourseClasses";
import { Eye, Edit, Trash2, UserPlus } from "lucide-react";
import InstructorBadge from "../../ui/InstructorBadge";
import { formatDateISO } from "../../utils/helpers";

export default function CourseClassesTable({
  isModalFormOpen,
  setIsModalFormOpen,
  courseIdx /* optional to prefilter */,
}) {
  const { role } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const [page, setPage] = useState(pageFromUrl);

  useEffect(() => setSearchParams({ page }), [page, setSearchParams]);

  const [query, setQuery] = useState("");
  const [editData, setEditData] = useState(null);
  const [assignClass, setAssignClass] = useState(null);
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [unassignConfirm, setUnassignConfirm] = useState(null);

  const pageSize = 10;
  const { data, isFetching, error } = useCourseClasses({
    page,
    page_size: pageSize,
    search: query,
    course_idx: courseIdx,
  });
  const classes = data?.data || [];
  const total_pages = data?.total_pages || 1;

  const createClass = useCreateCourseClass();
  const updateClass = useUpdateCourseClass();
  const deleteClass = useDeleteCourseClass();
  const unassignInstructor = useUnassignInstructor();

  useEffect(() => {
    if (error) toast.error(error.message || "Failed to load classes");
  }, [error]);

  const openEdit = (row) => {
    // Extract only the idx for the form
    const flattened = {
      ...row,
      course_idx: row.course.idx,
      term_idx: row.term.idx,
    };
    setEditData(flattened);
    setIsModalFormOpen(true);
  };

  const handleFormClose = () => {
    setIsModalFormOpen(false);
    setEditData(null);
  };

  const handleFormSubmit = async (payload) => {
    try {
      if (editData?.idx) {
        await updateClass.mutateAsync({ idx: editData.idx, data: payload });
        toast.success("Class updated");
      } else {
        await createClass.mutateAsync(payload);
        toast.success("Class created");
      }
      setIsModalFormOpen(true);
    } catch (err) {
      toast.error(err?.message || "Failed to save class");
    }
  };

  const confirmDelete = (idx) => {
    setDeleteIdx(idx);
    setIsConfirmOpen(true);
  };
  const handleConfirmDelete = async () => {
    try {
      await deleteClass.mutateAsync(deleteIdx);
      toast.success("Class deleted");
      setIsConfirmOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to delete class");
    }
  };

  const handleUnassign = async () => {
    if (!unassignConfirm) return;
    try {
      await unassignInstructor.mutateAsync({
        classIdx: unassignConfirm.classIdx,
        instructorIdx: unassignConfirm.instructorIdx,
      });
      toast.success("Instructor unassigned");
      setUnassignConfirm(null);
    } catch (err) {
      toast.error(err?.message || "Failed to unassign instructor");
    }
  };

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
            placeholder="Search classes..."
          />
        </div>
      </div>

      <div className="overflow-x-auto p-6">
        <Table
          columns={[
            { header: "Code", accessor: "code" },
            { header: "Course", accessor: "course.name" },
            { header: "Term", accessor: "term.name" },
            {
              header: "Start Date",
              render: (row) => formatDateISO(row.term.start_date),
            },
            {
              header: "End Date",
              render: (row) => formatDateISO(row.term.end_date),
            },
            {
              header: "Instructors",
              accessor: "instructors", // Keep accessor for potential sorting/filtering if needed, though render overrides display
              render: (row) =>
                row.instructors?.length ? (
                  <div className="flex flex-wrap items-center justify-start gap-1">
                    <ul className="space-y-1">
                      {row.instructors.map((ins) => (
                        <li
                          key={ins.idx}
                          className="flex items-center justify-between"
                        >
                          <InstructorBadge
                            key={ins.idx}
                            name={ins.name}
                            onUnassign={() =>
                              setUnassignConfirm({
                                classIdx: row.idx,
                                instructorIdx: ins.idx,
                                instructorName: ins.name,
                              })
                            }
                            ariaLabel={`Unassign ${ins.name} from ${row.code}`}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <span className="text-gray-500">—</span>
                ),
            },
            // {
            //   header: "Enrolled",
            //   render: (row) => (
            //     <button
            //       className="text-blue-600 hover:underline"
            //       onClick={() =>
            //         navigate(`/${role}/enrollments?class_idx=${row.idx}`)
            //       }
            //     >
            //       {row.enrollments_count} enrollments
            //     </button>
            //   ),
            // },
            {
              header: "Created",
              render: (row) =>
                row.created_on ? formatDateISO(row.created_on) : "—",
            },
            {
              header: <span className="sr-only">Actions</span>,
              render: (row) => (
                <div className="flex justify-end gap-2">
                  <IconButton
                    variant="ghost"
                    onClick={() => setAssignClass(row)}
                    title="Assign instructor"
                  >
                    <UserPlus className="h-4 w-4" />
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
          data={classes}
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

      {/* Confirm delete class */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteClass.isPending}
        title="Delete Class"
        message="Are you sure you want to delete this class?"
      />

      {/* Confirm unassign instructor */}
      <ConfirmDialog
        isOpen={!!unassignConfirm}
        onClose={() => setUnassignConfirm(null)}
        onConfirm={handleUnassign}
        isLoading={unassignInstructor.isPending}
        title="Unassign Instructor"
        message="Are you sure you want to unassign this instructor from the class?"
        confirmText="Unassign"
      />

      <CourseClassForm
        key={editData?.idx || "create"}
        isOpen={isModalFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        defaultValues={editData || undefined}
      />

      <AssignInstructorModal
        classData={assignClass}
        onClose={() => setAssignClass(null)}
      />
    </div>
  );
}
