// src/features/courses/TermForm.jsx
import Modal from "../../ui/Modal";
import FormRow from "../../ui/form/FormRow";
import Input from "../../ui/form/Input";
import Button from "../../ui/Button";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import Spinner from "../../ui/Spinner";

export default function TermForm({ isOpen, onClose, onSubmit, defaultValues }) {
  const isEdit = Boolean(defaultValues);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: defaultValues || {
      name: "",
      start_date: "",
      end_date: "",
    },
  });

  useEffect(
    () =>
      reset(
        defaultValues || {
          name: "",
          start_date: "",
          end_date: "",
        },
      ),
    [defaultValues, reset],
  );

  const submit = async (data) => {
    await onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit term" : "Create term"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="term-form" disabled={isSubmitting}>
            {isEdit ? "Save" : "Create"}
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
        id="term-form"
        onSubmit={handleSubmit(submit)}
        className={`space-y-4 ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
      >
        <FormRow label="Name" error={errors.name?.message}>
          <Input
            id="name"
            disabled={isSubmitting}
            {...register("name", { required: "Name is required" })}
          />
        </FormRow>
        <FormRow label="Start date" error={errors.start_date?.message}>
          <Input
            id="start_date"
            disabled={isSubmitting}
            type="date"
            {...register("start_date", { required: "Start date is required" })}
          />
        </FormRow>
        <FormRow label="End date" error={errors.end_date?.message}>
          <Input
            id="end_date"
            disabled={isSubmitting}
            type="date"
            {...register("end_date", { required: "End date is required" })}
          />
        </FormRow>
      </form>
    </Modal>
  );
}
