// src/features/students/StudentForm.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Spinner from "../../ui/Spinner";
import Avatar from "../../ui/Avatar";
import FormRow from "../../ui/form/FormRow";
import Input from "../../ui/form/Input";
import Select from "../../ui/form/Select";
import FileInput from "../../ui/form/FileInput";

import { gender } from "../../config/constants";
import { isFile } from "../../utils/helpers";

export default function StudentForm({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  isLoading = false,
}) {
  const isEdit = Boolean(defaultValues);

  const initialValues = useMemo(
    () => ({
      first_name: "",
      family_name: "",
      email: "",
      phone: "",
      dob: "",
      photo: null,
      photo_url: "",
      gender: "",
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
  const objectUrlRef = useRef(null);

  useEffect(() => {
    reset(initialValues);
    setPreview(initialValues.photo_url || "");

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, [initialValues, reset]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const submitHandler = async (data) => {
    let payload;
    if (isEdit) {
      payload = {
        first_name: data.first_name,
        family_name: data.family_name,
        email: data.email,
        dob: data.dob,
        phone: data.phone,
        gender: data.gender,
      };

      const newPhoto = data.photo?.[0];
      if (newPhoto && isFile(newPhoto)) {
        payload.photo = newPhoto;
      }
    } else {
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
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Student" : "Add Student"}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="student-form"
            disabled={isSubmitting || isLoading}
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
      {(isSubmitting || isLoading) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
          <Spinner size="md" color="gray" />
        </div>
      )}

      <form
        id="student-form"
        onSubmit={handleSubmit(submitHandler)}
        className={`space-y-4 ${
          isSubmitting || isLoading ? "pointer-events-none opacity-50" : ""
        }`}
      >
        {/* Avatar + File Upload */}
        <div className="flex flex-col items-center gap-3">
          <Avatar src={preview} size="lg" />
          <FormRow label="Profile Photo" error={errors?.photo}>
            <FileInput
              id="photo"
              disabled={isSubmitting || isLoading}
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

        <FormRow label="First Name" error={errors?.first_name?.message}>
          <Input
            id="first_name"
            disabled={isSubmitting || isLoading}
            {...register("first_name", { required: "First name is required" })}
          />
        </FormRow>

        <FormRow label="Family Name" error={errors?.family_name?.message}>
          <Input
            id="family_name"
            disabled={isSubmitting || isLoading}
            {...register("family_name", {
              required: "Family name is required",
            })}
          />
        </FormRow>

        <FormRow label="Email" error={errors?.email}>
          <Input
            id="email"
            disabled={isSubmitting}
            {...register("email", { required: "Email is required" })}
          />
        </FormRow>

        <FormRow label="Phone" error={errors?.phone?.message}>
          <Input
            id="phone"
            disabled={isSubmitting || isLoading}
            {...register("phone", { required: "Phone is required" })}
          />
        </FormRow>

        <FormRow label="Date of Birth" error={errors?.dob?.message}>
          <Input
            id="dob"
            type="date"
            disabled={isSubmitting || isLoading}
            {...register("dob", { required: "Date of birth is required" })}
          />
        </FormRow>

        {
          <FormRow label="Select Gender" error={errors.gender?.message}>
            <Select
              id="gender"
              disabled={isSubmitting || isLoading}
              options={gender}
              {...register("gender", { required: "Gender is required" })}
            />
          </FormRow>
        }
      </form>
    </Modal>
  );
}
