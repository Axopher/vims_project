// src/services/apiEnrollments.js
import apiClient from "../apiClient";

export const listEnrollments = async ({
  page = 1,
  page_size = 10,
  search = "",
} = {}) => {
  const res = await apiClient.get("/enrollments/", {
    params: { page, page_size, search },
  });
  return res.data;
};

export const createEnrollment = async ({
  student_idx,
  course_class_idx,
  status = "enquired",
  comment = "",
}) => {
  const payload = { student_idx, course_class_idx, status, comment };
  const res = await apiClient.post("/enrollments/", payload);
  return res.data;
};

export const updateEnrollment = async ({ idx, data }) => {
  const res = await apiClient.patch(`/enrollments/${idx}/`, data);
  return res.data;
};

export const deleteEnrollment = async ({ idx, comment = "" }) => {
  // soft delete via DELETE; pass body if your client supports it
  const res = await apiClient.delete(`/enrollments/${idx}/`, {
    data: { comment },
  });
  return res.data;
};
