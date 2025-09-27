// src/features/courses/CourseClassForm.jsx
import { useEffect } from "react";
import Modal from "../../ui/Modal";
import FormRow from "../../ui/form/FormRow";
import Input from "../../ui/form/Input";
import Select from "../../ui/form/Select";
import Button from "../../ui/Button";
import { useForm } from "react-hook-form";
import { useCourses } from "./useCourses";
import { useTerms } from "./useTerms";
import Spinner from "../../ui/Spinner";

/**
 * Basic class form: course_idx (select), term_idx (select), code
 * If parent passes defaultValues, it will be edit mode.
 */
export default function CourseClassForm({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  courseIdx,
}) {
  const isEdit = Boolean(defaultValues);
  const { data: coursesData } = useCourses({ page: 1, page_size: 999 });
  const { data: termsData } = useTerms({ page: 1, page_size: 999 });

  const courses = coursesData?.data || [];
  const terms = termsData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: defaultValues || {
      course_idx: courseIdx,
      term_idx: "",
      code: "",
    },
  });

  useEffect(() => {
    reset(defaultValues || { course_idx: courseIdx, term_idx: "", code: "" });
    if (courseIdx) {
      setValue("course_idx", courseIdx); // lock it
    }
  }, [defaultValues, reset, courseIdx, setValue]);

  const submitHandler = async (data) => {
    // force the course_idx if provided
    await onSubmit({ ...data, course_idx: courseIdx || data.course_idx });
    reset(); // clear form
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Class" : "Create Class"}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="class-form" disabled={isSubmitting}>
            {isSubmitting ? (isEdit ? "Saving..." : "Creating...") : "Save"}
          </Button>
        </>
      }
    >
      {/* This is the loading overlay. It is conditionally rendered */}
      {/* based on the isSubmitting state. */}
      {isSubmitting && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
          <Spinner size="md" color="gray" />
        </div>
      )}

      <form
        id="class-form"
        onSubmit={handleSubmit(submitHandler)}
        className={`space-y-4 ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
      >
        {/* Hide course select if parent forces courseIdx */}
        {!courseIdx && (
          <FormRow label="Course" error={errors.course_idx?.message}>
            <Select
              id="course"
              disabled={isSubmitting}
              {...register("course_idx", { required: "Course is required" })}
              options={courses.map((c) => ({ value: c.idx, label: c.name }))}
            />
          </FormRow>
        )}

        <FormRow label="Term" error={errors.term_idx?.message}>
          <Select
            id="term"
            disabled={isSubmitting}
            {...register("term_idx", { required: "Term is required" })}
            options={terms.map((t) => ({ value: t.idx, label: t.name }))}
          />
        </FormRow>

        <FormRow label="Class Code" error={errors.code?.message}>
          <Input
            id="class_code"
            disabled={isSubmitting}
            {...register("code", { required: "Class code is required" })}
          />
        </FormRow>
      </form>
    </Modal>
  );
}
