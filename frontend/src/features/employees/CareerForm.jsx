// src/features/employees/CareerForm.jsx
import { useForm } from "react-hook-form";
import Modal from "../../ui/Modal";
// import Input from "../../ui/Input";
import Input from "../../ui/form/Input";
import Button from "../../ui/Button";
import Spinner from "../../ui/Spinner";
import { useEffect, useMemo } from "react";
import FormRow from "../../ui/form/FormRow";

export default function CareerForm({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  serverErrors = {},
}) {
  const isEdit = Boolean(defaultValues);

  // prevents expensive calculations from running on every render if default values has not changes, memoization
  const initialValues = useMemo(
    () => ({
      function: "",
      competence_area: "",
      start_date: "",
      end_date: "",
      salary: "",
      ...(defaultValues || {}),
    }),
    [defaultValues],
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  // Apply backend errors dynamically when they change
  useEffect(() => {
    Object.entries(serverErrors).forEach(([field, messages]) => {
      if (field === "non_field_errors") {
        // Attach a global error
        setError("root.serverError", {
          type: "server",
          message: Array.isArray(messages) ? messages[0] : messages,
        });
      } else {
        setError(field, {
          type: "server",
          message: Array.isArray(messages) ? messages[0] : messages,
        });
      }
    });
  }, [serverErrors, setError]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Career Record" : "Add Career Record"}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="career-form" disabled={isSubmitting}>
            {isSubmitting ? (isEdit ? "Saving..." : "Creating...") : "Save"}
          </Button>
        </>
      }
    >
      {isSubmitting && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
          <Spinner size="md" color="gray" />
        </div>
      )}

      <form
        id="career-form"
        onSubmit={handleSubmit(onSubmit)}
        className={`space-y-4 ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
      >
        {errors.root?.serverError && (
          <p className="text-sm text-red-500">
            {errors.root.serverError.message}
          </p>
        )}

        <FormRow label="Function" error={errors.function?.message}>
          <Input
            id="function"
            disabled={isSubmitting}
            {...register("function", { required: "Function is required" })}
          />
        </FormRow>

        <FormRow
          label="Competence Area"
          error={errors.competence_area?.message}
        >
          <Input
            id="competence_area"
            disabled={isSubmitting}
            {...register("competence_area", {
              required: "Competence area is required",
            })}
          />
        </FormRow>

        <FormRow label="Start Date" error={errors.start_date?.message}>
          <Input
            id="start_date"
            type="date"
            disabled={isSubmitting}
            {...register("start_date", { required: "Start date is required" })}
          />
        </FormRow>

        <FormRow label="End Date" error={errors.end_date?.message}>
          <Input
            id="end_date"
            type="date"
            disabled={isSubmitting}
            {...register("end_date")}
          />
        </FormRow>

        <FormRow label="Salary" error={errors.salary?.message}>
          <Input
            id="salary"
            type="number"
            step="0.01"
            {...register("salary", { required: "Salary is required" })}
          />
        </FormRow>
      </form>
    </Modal>
  );
}
