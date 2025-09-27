// src/services/apiInstructor.js
import apiClient from "../apiClient";

export const listInstructors = async () => {
  const res = await apiClient.get("/instructors/");
  return res.data;
};
