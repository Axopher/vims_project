// src/features/courses/CourseForm.jsx
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../ui/Modal";
import FormRow from "../../ui/form/FormRow";
import Input from "../../ui/form/Input";
import Textarea from "../../ui/form/Textarea";
import Button from "../../ui/Button";
import Spinner from "../../ui/Spinner";

export default function CourseForm({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  isLoading = false,
}) {
  const isEdit = Boolean(defaultValues);

  const initialValues = useMemo(
    () => ({
      name: "",
      code: "",
      description: "",
      ...(defaultValues || {}),
    }),
    [defaultValues],
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
    await onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Course" : "Add Course"}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="course-form"
            disabled={isLoading || isSubmitting}
          >
            {isSubmitting || isLoading
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : "Save"}
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
        id="course-form"
        onSubmit={handleSubmit(submitHandler)}
        className="space-y-4"
      >
        <FormRow label="Code" error={errors.code?.message}>
          <Input {...register("code", { required: "Code is required" })} />
        </FormRow>

        <FormRow label="Name" error={errors.name?.message}>
          <Input {...register("name", { required: "Name is required" })} />
        </FormRow>

        <FormRow label="Description" error={errors.description?.message}>
          <Textarea {...register("description")} rows={3} />
        </FormRow>
      </form>
    </Modal>
  );
}
