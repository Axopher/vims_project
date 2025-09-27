// vims_project/frontend/src/features/employees/EmployeeForm.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Spinner from "../../ui/Spinner";
import { gender, roles } from "../../config/constants";
import Avatar from "../../ui/Avatar";
import { isFile } from "../../utils/helpers";

import FormRow from "../../ui/form/FormRow";
import Input from "../../ui/form/Input";
import Select from "../../ui/form/Select";
import FileInput from "../../ui/form/FileInput";

export default function EmployeeForm({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
}) {
  const isEdit = Boolean(defaultValues);

  // prevents expensive calculations from running on every render if default values has not change, memoization
  const initialValues = useMemo(
    () => ({
      email: "",
      code: "",
      first_name: "",
      family_name: "",
      gender: "",
      role: "",
      photo: null,
      photo_url: "",
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

  const [preview, setPreview] = useState(initialValues.photo_url || "");
  const objectUrlRef = useRef(null); // to revoke old blobs

  // Reset form when edit data changes
  // Although key prop in it's parent does the repainting stuff but still keeping it as a belt-and-suspenders approach
  useEffect(() => {
    reset(initialValues);
    setPreview(initialValues.photo_url || "");

    // revoke any previous object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, [initialValues, reset]);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []); // [] prevents memory leaks if user navigates away.

  const submitHandler = async (data) => {
    let payload;

    if (isEdit) {
      // For updates, build a payload with only allowed fields
      payload = {
        first_name: data.first_name,
        family_name: data.family_name,
        code: data.code,
      };

      // Only include the photo if a new one was selected
      // The FileList from the input is not a true array, so we check the first item.
      // We also need to check if that first item is a File object, not a URL string.
      const newPhoto = data.photo[0];
      if (newPhoto && isFile(newPhoto)) {
        payload.photo = newPhoto;
      }
    } else {
      // For creation, send the whole payload
      payload = { ...data };
      delete payload.photo_url;
      const newPhoto = payload.photo?.[0];
      if (newPhoto && isFile(newPhoto)) {
        payload.photo = newPhoto;
      } else {
        delete payload.photo;
      }
    }

    await onSubmit(payload);
    reset(); // clear form
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Employee" : "Add Employee"}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="employee-form" disabled={isSubmitting}>
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
        id="employee-form"
        onSubmit={handleSubmit(submitHandler)}
        className={`space-y-4 ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
      >
        {/* Avatar + File Upload */}
        <div className="flex flex-col items-center gap-3">
          <Avatar src={preview} size="lg" />

          <FormRow label="Profile Photo" error={errors?.photo}>
            <FileInput
              id="photo"
              disabled={isSubmitting}
              {...register("photo", {
                onChange: (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (objectUrlRef.current)
                      URL.revokeObjectURL(objectUrlRef.current);
                    const url = URL.createObjectURL(file);
                    objectUrlRef.current = url;
                    setPreview(url);
                  }
                },
              })}
            />
          </FormRow>
        </div>

        {!isEdit && (
          <FormRow label="Email" error={errors?.email}>
            <Input
              id="email"
              disabled={isSubmitting}
              {...register("email", { required: "Email is required" })}
            />
          </FormRow>
        )}

        <FormRow label="Code" error={errors?.code}>
          <Input
            id="code"
            disabled={isSubmitting}
            {...register("code", { required: "Code is required" })}
          />
        </FormRow>

        <FormRow label="First Name" error={errors?.first_name}>
          <Input
            id="first_name"
            disabled={isSubmitting}
            {...register("first_name", { required: "First name is required" })}
          />
        </FormRow>

        <FormRow label="Family Name" error={errors?.family_name}>
          <Input
            id="family_name"
            disabled={isSubmitting}
            {...register("family_name", {
              required: "Family name is required",
            })}
          />
        </FormRow>

        {!isEdit && (
          <FormRow label="Select Gender" error={errors.gender?.message}>
            <Select
              id="gender"
              disabled={isSubmitting}
              options={gender}
              {...register("gender", { required: "Gender is required" })}
            />
          </FormRow>
        )}

        {!isEdit && (
          <FormRow label="Select Role" error={errors.role?.message}>
            <Select
              id="role"
              disabled={isSubmitting}
              options={roles}
              {...register("role", { required: "Role is required" })}
            />
          </FormRow>
        )}
      </form>
    </Modal>
  );
}
