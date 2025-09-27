// vims_project/frontend/src/features/students/EnrollmentForm.jsx
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Spinner from "../../ui/Spinner";

import FormRow from "../../ui/form/FormRow";
import Input from "../../ui/form/Input";
import Select from "../../ui/form/Select";
import { useStudents, useCourseClasses } from "./useStudents";

/**
 * EnrollmentForm
 *
 * Props:
 * - isOpen
 * - onClose
 * - onSubmit (async)
 * - defaultValues (optional) => { student_idx, course_class_idx, status, comment }
 * - isLoading (optional) - shows overlay when true
 */
export default function EnrollmentForm({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  isLoading = false,
}) {
  const isEdit = Boolean(defaultValues);

  const initialValues = useMemo(
    () => ({
      student_idx: "",
      course_class_idx: "",
      status: "enquired",
      comment: "",
      ...(defaultValues || {}),
    }),
    [defaultValues],
  );

  const { data: studentsResp } = useStudents({
    page: 1,
    page_size: 200,
    search: "",
  });
  const students = useMemo(() => {
    return studentsResp?.data ?? [];
  }, [studentsResp?.data]);

  const { data: classesResp } = useCourseClasses({
    page: 1,
    page_size: 200,
    search: "",
  });
  const classes = useMemo(() => {
    return classesResp?.data ?? [];
  }, [classesResp?.data]);

  const studentOptions = useMemo(
    () =>
      students.map((s) => ({
        value: s.idx,
        label: `${s.first_name} ${s.family_name} — ${s.dob}`,
      })),
    [students],
  );

  const classOptions = useMemo(
    () =>
      classes.map((c) => ({
        value: c.idx,
        label: `${c.code} — ${c.course?.name || ""} — ${c.term?.name || ""}`,
      })),
    [classes],
  );

  const statusOptions = useMemo(
    () => [
      { value: "active", label: "Active" },
      { value: "enquired", label: "Enquired" },
      { value: "closed", label: "Closed" },
    ],
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const submitHandler = async (data) => {
    let payload;
    if (isEdit) {
      payload = {
        course_class_idx: data.course_class_idx,
        status: data.status,
        comment: data.comment?.trim() || "",
      };
    } else {
      payload = {
        student_idx: data.student_idx,
        course_class_idx: data.course_class_idx,
        status: data.status,
        comment: data.comment?.trim() || "",
      };
    }

    await onSubmit(payload);
    reset(initialValues);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Enrollment" : "Add Enrollment"}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="enrollment-form" disabled={isSubmitting}>
            {isSubmitting
              ? isEdit
                ? "Saving..."
                : "Enrolling..."
              : isEdit
                ? "Save"
                : "Enroll"}
          </Button>
        </>
      }
    >
      {(isLoading || isSubmitting) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
          <Spinner size="md" color="gray" />
        </div>
      )}

      <form
        id="enrollment-form"
        onSubmit={handleSubmit(submitHandler)}
        className={`space-y-4 ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
      >
        <FormRow label="Student" error={errors.student_idx?.message}>
          <Select
            id="student_idx"
            options={studentOptions}
            disabled={isEdit}
            {...register("student_idx", {
              required: !isEdit ? "Student is required" : false,
            })}
          />
        </FormRow>

        <FormRow label="Course Class" error={errors.course_class_idx?.message}>
          <Select
            id="course_class_idx"
            options={classOptions}
            {...register("course_class_idx", {
              required: "Course class is required",
            })}
          />
        </FormRow>

        <FormRow label="Status" error={errors.status?.message}>
          <Select
            id="status"
            options={statusOptions}
            {...register("status", { required: "Status is required" })}
          />
        </FormRow>

        <FormRow label="Comment" error={errors.comment?.message}>
          <Input
            id="comment"
            {...register("comment")}
            placeholder="Optional comment"
          />
        </FormRow>
      </form>
    </Modal>
  );
}
