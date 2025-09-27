// src/services/student/apiStudent.js
import apiClient from "../apiClient";

// Students
export const listStudents = async ({
  page = 1,
  page_size = 5,
  search = "",
} = {}) => {
  const res = await apiClient.get("/students/", {
    params: { page, page_size, search },
  });
  return res.data;
};

export const getStudentByIdx = async (idx) => {
  const res = await apiClient.get(`/students/${idx}/`);
  return res.data;
};

export const createStudent = async (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([k, v]) => formData.append(k, v));
  const res = await apiClient.post("/students/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateStudent = async ({ idx, data }) => {
  const formData = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    formData.append(k, v);
  });
  const res = await apiClient.patch(`/students/${idx}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteStudent = async (idx) => {
  const res = await apiClient.delete(`/students/${idx}/`);
  return res.data;
};

// Enroll / Unenroll
export const enrollStudent = async ({
  idx,
  course_class_idx,
  status = "active",
  comment = "",
}) => {
  const payload = { course_class_idx, status, comment };
  const res = await apiClient.post(`/students/${idx}/enroll/`, payload);
  return res.data;
};

export const unenrollStudent = async ({ idx, course_class_idx }) => {
  const payload = { course_class_idx };
  const res = await apiClient.post(`/students/${idx}/unenroll/`, payload);
  return res.data;
};

export const getStudentEnrollments = async (studentIdx) => {
  const res = await apiClient.get(`/students/${studentIdx}/enrollments/`);
  return res.data;
};

// Custodians (list / create / update / delete)
export const listCustodians = async ({
  page = 1,
  page_size = 10,
  search = "",
} = {}) => {
  const res = await apiClient.get("/custodians/", {
    params: { page, page_size, search },
  });
  return res.data;
};

export const listStudentCustodians = async (studentIdx) => {
  const res = await apiClient.get(`/students/${studentIdx}/custodians/`);
  // backend may return array or envelope — try to return array
  return res.data;
};

export const createCustodian = async ({ data }) => {
  // student_idx is passed inside data
  const res = await apiClient.post("/custodians/", data);
  return res.data;
};

export const updateCustodian = async ({ idx, data }) => {
  const res = await apiClient.put(`/custodians/${idx}/`, data);
  return res.data;
};

export const deleteCustodian = async ({ idx }) => {
  const res = await apiClient.delete(`/custodians/${idx}/`);
  return res.data;
};
