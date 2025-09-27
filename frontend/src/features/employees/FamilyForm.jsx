// src/features/employees/FamilyForm.jsx
import { useForm } from "react-hook-form";
import Modal from "../../ui/Modal";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import Spinner from "../../ui/Spinner";
import { useEffect, useMemo } from "react";

export default function FamilyForm({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  serverErrors = {},
}) {
  const isEdit = Boolean(defaultValues);

  const initialValues = useMemo(
    () => ({
      name: "",
      relation: "",
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

  useEffect(() => {
    Object.entries(serverErrors).forEach(([field, messages]) => {
      setError(field, {
        type: "server",
        message: Array.isArray(messages) ? messages[0] : messages,
      });
    });
  }, [serverErrors, setError]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Family Member" : "Add Family Member"}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="family-form" disabled={isSubmitting}>
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
        id="family-form"
        onSubmit={handleSubmit(onSubmit)}
        className={`space-y-4 ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
      >
        <Input
          label="Name"
          {...register("name", { required: "Name is required" })}
          error={errors.name?.message}
        />
        <Input
          label="Relation"
          {...register("relation", { required: "Relation is required" })}
          error={errors.relation?.message}
        />
      </form>
    </Modal>
  );
}
