// src/features/students/StudentDetail.jsx
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useState } from "react";
import { Tab, TabGroup, TabList, TabPanels, TabPanel } from "@headlessui/react";

import Button from "../../ui/Button";
import Spinner from "../../ui/Spinner";
import Avatar from "../../ui/Avatar";
import StatusBadge from "../../ui/StatusBadge";
import StudentForm from "./StudentForm";
import { useStudent, useUpdateStudent } from "./useStudents";
import StudentEnrollments from "./StudentEnrollments";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";

// ⬇️ placeholder for custodians CRUD table
import StudentCustodians from "./StudentCustodians";
import InfoItem from "../../ui/InfoItem";

export default function StudentDetail() {
  const { idx, role } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = searchParams.get("page") || 1;

  const queryClient = useQueryClient();
  const { data: student, isFetching, error } = useStudent(idx);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const updateStudent = useUpdateStudent();

  if (isFetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">Failed to load student details</div>
    );
  }

  const fullName = `${student.first_name ?? ""} ${student.family_name ?? ""}`;
  const email = student.email ?? student.user?.email;
  const gender = student.gender ?? student.user?.gender;
  // const status = student.is_active;

  return (
    <div className="space-y-8">
      {/* Top actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/${role}/students?page=${page}`)}
          >
            ← Back
          </Button>
          <Link
            to={`/${role}/students`}
            className="text-sm text-blue-600 hover:underline"
          >
            All students
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsEditOpen(true)}>
            <div className="flex items-center">
              <Pencil className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Edit</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Header card */}
      <div className="rounded-2xl border bg-white p-8 shadow-md transition hover:shadow-lg">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
          <Avatar src={student.photo} alt={fullName} size="xl" />
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-semibold text-gray-900">
              {fullName || "—"}
            </h1>
            {/* <div className="mt-1 flex flex-wrap items-center gap-3 text-base text-gray-600"> */}
              {/* {email && <span>{email}</span>} */}
              {/* <StatusBadge isActive={status} /> */}
            {/* </div> */}
            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
              <InfoItem label="Email" value={student.email} />
              <InfoItem label="Phone" value={student.phone} />
              <InfoItem label="DOB" value={student.dob} />
              <InfoItem label="Gender" value={gender} />
              <InfoItem
                label="Custodians"
                value={student.custodians?.length ?? 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TabGroup>
        <TabList className="flex gap-2 rounded-xl bg-gray-100 p-2">
          {["Overview", "Custodians", "Enrollments"].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                `w-full rounded-lg px-5 py-2 text-sm font-medium transition ${
                  selected
                    ? "bg-white text-blue-700 shadow"
                    : "text-gray-600 hover:text-gray-800"
                }`
              }
            >
              {tab}
            </Tab>
          ))}
        </TabList>

        <TabPanels className="mt-6">
          {/* Overview */}
          <TabPanel>
            <div className="rounded-2xl border bg-white p-8 shadow-md">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <InfoItem label="Email" value={email} />
                <InfoItem label="Gender" value={gender} />
                <InfoItem label="DOB" value={student.dob} />
                <InfoItem label="Phone" value={student.phone} />
              </div>
            </div>
          </TabPanel>

          {/* Custodians */}
          <TabPanel>
            <StudentCustodians studentIdx={idx} />
          </TabPanel>

          {/* Enrollments */}
          <TabPanel>
            <StudentEnrollments studentIdx={idx} />
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Edit Form */}
      <StudentForm
        key={student.idx || "student-edit"}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        isLoading={updateStudent.isPending}
        defaultValues={student}
        onSubmit={async (payload) => {
          try {
            await updateStudent.mutateAsync({
              idx: student.idx,
              data: payload,
            });
            queryClient.invalidateQueries({
              queryKey: ["student", student.idx],
            });
            queryClient.invalidateQueries({ queryKey: ["students"] });
            setIsEditOpen(false);
          } catch (error) {
            console.error("Failed to update student:", error);
            throw error;
          }
        }}
      />
    </div>
  );
}
