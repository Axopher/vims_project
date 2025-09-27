// src/features/students/StudentEnrollments.jsx
import { useStudentEnrollments, useUnenrollStudent } from "./useStudents";
import Table from "../../ui/Table";
import Button from "../../ui/Button";

export default function StudentEnrollments({ studentIdx }) {
  const { data: enrollments = [], isFetching } =
    useStudentEnrollments(studentIdx);
  const unenroll = useUnenrollStudent();

  const columns = [
    { header: "Course", accessor: "course_class.course.name" },
    { header: "Course Code", accessor: "course_class.course.code" },
    { header: "Class Code", accessor: "course_class.code" },
    { header: "Term", accessor: "course_class.term.name" },
    {
      header: "Instructor(s)",
      render: (row) =>
        row.course_class?.instructors?.length > 0
          ? row.course_class.instructors.map((i) => i.name).join(", ")
          : "—",
    },
    { header: "Status", accessor: "status" },
    { header: "Comment", accessor: "comment" },
    // {
    //   header: "",
    //   render: (row) => (
    //     <Button
    //       size="sm"
    //       variant="danger"
    //       disabled={unenroll.isPending}
    //       onClick={() =>
    //         unenroll.mutate({
    //           idx: studentIdx,
    //           course_class_idx: row.course_class?.idx,
    //         })
    //       }
    //     >
    //       {unenroll.isPending ? "..." : "Unenroll"}
    //     </Button>
    //   ),
    // },
  ];

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Enrollments ({enrollments.length})
      </h3>
      <Table columns={columns} data={enrollments} isLoading={isFetching} />
    </div>
  );
}
