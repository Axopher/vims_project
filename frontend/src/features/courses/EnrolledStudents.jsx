// src/features/courses/EnrolledStudents.jsx
import Modal from "../../ui/Modal";
import Table from "../../ui/Table";
import Button from "../../ui/Button";
import { useEnrolledStudents } from "./useCourseClasses";
import { useEffect } from "react";

export default function EnrolledStudents({ classData, onClose }) {
  const classIdx = classData?.idx;
  const { data, isFetching, error } = useEnrolledStudents(classIdx);

  console.log("Enrollments data:", data);

  useEffect(() => {
    // handle errors if necessary
  }, [error]);

  if (!classData) return null;

  const enrollments = data || [];

  return (
    <Modal
      isOpen={!!classData}
      onClose={onClose}
      title={`Enrolled — ${classData.code || ""}`}
      footer={<Button onClick={onClose}>Close</Button>}
    >
      <div>
        <Table
          columns={[
            {
              header: "Student",
              accessor: (r) =>
                `${r.student.first_name} ${r.student.family_name}`,
            },
            { header: "DOB", accessor: "student.dob" },
            { header: "Phone", accessor: "student.phone" },
            { header: "Status", accessor: "status" },
            { header: "Payment", accessor: (r) => r.payment_status || "-" },
          ]}
          data={enrollments}
          isLoading={isFetching}
        />
      </div>
    </Modal>
  );
}
