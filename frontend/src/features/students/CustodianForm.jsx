// src/features/students/CustodianForm.jsx
import { useForm } from "react-hook-form";
import Modal from "../../ui/Modal";
import Input from "../../ui/form/Input";
import Button from "../../ui/Button";
import Spinner from "../../ui/Spinner";
import { useEffect } from "react";
import FormRow from "../../ui/form/FormRow";

export default function CustodianForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  serverErrors = {},
  isOpen,
  onClose,
  isEdit,
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {
      name: "",
      relation: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  // map backend errors into react-hook-form
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
      title={isEdit ? "Edit Custodian" : "Add Custodian"}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="custodian-form" disabled={isSubmitting}>
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
        id="custodian-form"
        onSubmit={handleSubmit(onSubmit)}
        className={`space-y-4 ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
      >
        {errors.root?.serverError && (
          <p className="text-sm text-red-500">
            {errors.root.serverError.message}
          </p>
        )}

        <FormRow label="Name" error={errors.name?.message}>
          <Input
            id="name"
            disabled={isSubmitting}
            {...register("name", { required: "Name is required" })}
          />
        </FormRow>

        <FormRow label="Relation" error={errors.relation?.message}>
          <Input
            id="relation"
            disabled={isSubmitting}
            {...register("relation", { required: "Relation is required" })}
          />
        </FormRow>

        <FormRow label="Phone" error={errors.phone?.message}>
          <Input id="phone" disabled={isSubmitting} {...register("phone")} />
        </FormRow>

        <FormRow label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            disabled={isSubmitting}
            {...register("email")}
          />
        </FormRow>
      </form>
    </Modal>
  );
}
