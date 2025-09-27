// src/services/apiCourseClass.js
import apiClient from "../apiClient";

export const listCourseClasses = async ({
  page = 1,
  page_size = 10,
  search = "",
  course_idx = "",
  term_idx = "",
} = {}) => {
  const params = { page, page_size, search };
  if (course_idx) params.course_idx = course_idx;
  if (term_idx) params.term_idx = term_idx;
  const res = await apiClient.get("/course-classes/", { params });
  return res.data;
};

export const getCourseClassByIdx = async (idx) => {
  const res = await apiClient.get(`/course-classes/${idx}/`);
  return res.data;
};

export const createCourseClass = async (data) => {
  const res = await apiClient.post("/course-classes/", data);
  return res.data;
};

export const updateCourseClass = async ({ idx, data }) => {
  const res = await apiClient.put(`/course-classes/${idx}/`, data);
  return res.data;
};

export const deleteCourseClass = async (idx) => {
  const res = await apiClient.delete(`/course-classes/${idx}/`);
  return res.data;
};

// assign/unassign instructor
export const assignInstructor = async ({
  classIdx,
  instructor_idx,
  assigned_on,
}) => {
  const payload = { instructor_idx };
  if (assigned_on) payload.assigned_on = assigned_on;
  const res = await apiClient.post(
    `/course-classes/${classIdx}/assign-instructor/`,
    payload,
  );
  return res.data;
};

export const unassignInstructor = async ({ classIdx, instructor_idx }) => {
  const res = await apiClient.post(
    `/course-classes/${classIdx}/unassign-instructor/`,
    { instructor_idx },
  );
  return res.data;
};

export const getEnrolledStudents = async (classIdx) => {
  console.log("Fetching enrolled students for classIdx:", classIdx);
  const res = await apiClient.get(
    `/course-classes/${classIdx}/enrolled-students/`,
  );
  return res.data; // your shape: array of enrollment objects
};
