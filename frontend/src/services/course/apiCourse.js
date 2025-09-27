// src/services/apiCourse.js
import apiClient from "../apiClient";

export const getCourses = async ({ page = 1, page_size = 10, search = "" } = {}) => {
  const res = await apiClient.get("/courses/", { params: { page, page_size, search } });
  return res.data; // envelope with total_pages, current_page, data...
};

export const getCourseByIdx = async (idx) => {
  const res = await apiClient.get(`/courses/${idx}/`);
  return res.data;
};

export const createCourse = async (data) => {
  // No multipart expected for courses (unless you have file uploads). Send JSON.
  const res = await apiClient.post("/courses/", data);
  return res.data;
};

export const updateCourse = async ({ idx, data }) => {
  const res = await apiClient.put(`/courses/${idx}/`, data);
  console.log("Updated course response:", res.data);
  return res.data;
};

export const deleteCourse = async (idx) => {
  const res = await apiClient.delete(`/courses/${idx}/`);
  return res.data;
};
