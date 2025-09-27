// src/features/courses/CourseDetail.jsx
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Spinner from "../../ui/Spinner";
import Button from "../../ui/Button";
import { Tab, TabGroup, TabList, TabPanels, TabPanel } from "@headlessui/react";
import CourseForm from "./CourseForm";
import StatusBadge from "../../ui/StatusBadge";
import { useCourse, useUpdateCourse } from "./useCourses";
import { Pencil, ArrowLeft, BookOpen } from "lucide-react";
import { useState } from "react";
import CourseClassForm from "./CourseClassForm";
import InfoItem from "../../ui/InfoItem";
import { formatDateISO } from "../../utils/helpers";

/**
 * Small info card used in the quick facts grid.
 */

export default function CourseDetail() {
  const { idx, role } = useParams(); // route: /:role/courses/:idx

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = searchParams.get("page") || 1;

  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // fetch course
  const { data: courseData, isPending, error } = useCourse(idx);

  const updateCourse = useUpdateCourse();
  // local state to open edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  // Derived display values
  const course = courseData || {};
  const description = course.description || "—";
  const code = course.code || "—";
  // backend may include arrays like course.classes; handle gracefully
  const classesCount = Array.isArray(course.classes)
    ? course.classes.length
    : (course.classes_count ?? "-");
  const termsCount = Array.isArray(course.terms)
    ? course.terms.length
    : (course.terms_count ?? "-");
  const enrolledCount = course.enrolled_count ?? "-";

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Failed to load course. {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/${role}/courses?page=${page}`)}
          >
            <div className="flex items-center">← Back</div>
          </Button>
          <Link
            to={`/${role}/courses?page=${page}`}
            className="text-sm text-blue-600 hover:underline"
          >
            All courses
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit opens modal (no separate edit page) */}
          <Button onClick={() => setIsEditOpen(true)}>
            <div className="flex items-center">
              <Pencil className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Edit</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Header card */}
      <div className="rounded-2xl border bg-white p-6 shadow-md transition hover:shadow-lg">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          {/* The BookOpen icon goes here */}
          <BookOpen className="h-24 w-24 shrink-0 text-gray-500" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="truncate text-3xl font-semibold text-gray-900">
                  {course.name || "Untitled course"}
                </h1>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                  <span className="font-medium text-gray-700">{code}</span>
                  <StatusBadge isActive={true} />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg border bg-white p-4 text-sm text-gray-700">
              <strong className="block text-xs text-gray-500">
                Description
              </strong>
              <p className="mt-1">{description}</p>
            </div>

            {/* Quick facts */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-5">
              <InfoItem label="Course Code" value={code} />
              <InfoItem label="Classes" value={classesCount} />
              <InfoItem label="Enrolled" value={enrolledCount} />
              <InfoItem label="Terms" value={termsCount} />
              <InfoItem
                label="Created On"
                value={formatDateISO(course.created_on)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Overview / Classes / Terms */}
      <TabGroup>
        <TabList className="flex gap-2 rounded-xl bg-gray-100 p-2">
          {["Overview", "Classes", "Terms"].map((t) => (
            <Tab
              key={t}
              className={({ selected }) =>
                `w-full rounded-lg px-5 py-2 text-sm font-medium transition ${
                  selected
                    ? "bg-white text-blue-700 shadow"
                    : "text-gray-600 hover:text-gray-800"
                }`
              }
            >
              {t}
            </Tab>
          ))}
        </TabList>

        <TabPanels className="mt-6">
          <TabPanel>
            <div className="rounded-2xl border bg-white p-6 shadow-md">
              <h3 className="text-lg font-semibold">Overview</h3>
              <p className="mt-3 text-sm text-gray-700">
                {/* You can expand with syllabus, objectives, prerequisites etc. */}
                {course.long_description ||
                  course.description ||
                  "No extended description available."}
              </p>
            </div>
          </TabPanel>

          <TabPanel>
            <div className="space-y-4 rounded-2xl border bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Classes</h3>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/${role}/classes?course_idx=${idx}`}
                    state={{ breadcrumbTitle: course.name }}
                  >
                    <Button size="sm">Manage classes</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Create class
                  </Button>
                </div>
              </div>

              {/* Placeholder: Replace with CourseClassesTable filtered by course */}
              <p className="text-sm text-gray-600">
                You can view and manage classes for this course from the classes
                management page.
              </p>
            </div>
          </TabPanel>

          <TabPanel>
            <div className="rounded-2xl border bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Terms</h3>
                <Link to={`/${role}/terms`}>
                  <Button size="sm">Manage terms</Button>
                </Link>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Terms that include this course will be shown here once you add
                them via the Term or Class creation flows.
              </p>
            </div>
          </TabPanel>

          {/* <TabPanel>
            <div className="rounded-2xl border bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Enrolled Students</h3>
                <Link to={`/${role}/enrollments?class_idx=${class.idx}`}>
                  <Button size="sm">Manage enrollments</Button>
                </Link>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                List of students enrolled across classes will be shown here once
                classes are created.
              </p>
            </div>
          </TabPanel> */}
        </TabPanels>
      </TabGroup>

      {/* Edit modal (uses your CourseForm) */}
      <CourseForm
        key={course.idx || "course-edit"}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={async (payload) => {
          // useUpdateCourse (mutation) to apply updates
          try {
            await updateCourse.mutateAsync({ idx: course.idx, data: payload });
            // after update, refetch course
            queryClient.invalidateQueries({ queryKey: ["course", course.idx] });
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            setIsEditOpen(false);
          } catch (err) {
            // use toast in parent or let mutation's onError handle it
            console.error("Failed to update course:", err);
            throw err;
          }
        }}
        isLoading={updateCourse.isLoading}
        defaultValues={course}
      />

      {/* This is the new modal for creating a course class */}
      <CourseClassForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data) => console.log("Create class form submitted:", data)}
        defaultValues={null}
        courseIdx={course.idx}
      />
    </div>
  );
}
