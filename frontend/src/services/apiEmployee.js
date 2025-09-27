// src/services/employee.js
import apiClient from "./apiClient";

// --- Employee CRUD ---
export const getEmployees = async ({ page = 1, search = "" }) => {
  const res = await apiClient.get("/employees/", { params: { page, search } });
  return res.data;
};

export const createEmployee = async (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([k, v]) => formData.append(k, v));
  const res = await apiClient.post("/employees/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateEmployee = async ({ id, data }) => {
  const formData = new FormData();
  Object.entries(data).forEach(([k, v]) => formData.append(k, v));
  const res = await apiClient.patch(`/employees/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteEmployee = async (id) => {
  const res = await apiClient.delete(`/employees/${id}/`);
  return res.data;
};

export const getEmployeeByIdx = async (id) => {
  const res = await apiClient.get(`/employees/${id}/`);
  return res.data;
};


/** CAREER */
export const listCareer = async (employeeIdx) => {
  const res = await apiClient.get(`/employees/${employeeIdx}/career/`);
  return res.data; // array
};

export const createCareer = async ({ employeeIdx, data }) => {
  const res = await apiClient.post(`/employees/${employeeIdx}/career/`, data);
  return res.data;
};

export const updateCareer = async ({ employeeIdx, idx, data }) => {
  const res = await apiClient.put(
    `/employees/${employeeIdx}/career/${idx}/`,
    data,
  );
  return res.data;
};

export const deleteCareer = async ({ employeeIdx, idx }) => {
  const res = await apiClient.delete(
    `/employees/${employeeIdx}/career/${idx}/`,
  );
  return res.data;
};

/** FAMILY */
export const listFamily = async (employeeIdx) => {
  const res = await apiClient.get(`/employees/${employeeIdx}/family/`);
  return res.data; // array
};

export const createFamily = async ({ employeeIdx, data }) => {
  const res = await apiClient.post(`/employees/${employeeIdx}/family/`, data);
  return res.data;
};

export const updateFamily = async ({ employeeIdx, idx, data }) => {
  const res = await apiClient.put(
    `/employees/${employeeIdx}/family/${idx}/`,
    data,
  );
  return res.data;
};

export const deleteFamily = async ({ employeeIdx, idx }) => {
  const res = await apiClient.delete(
    `/employees/${employeeIdx}/family/${idx}/`,
  );
  return res.data;
};
