// src/services/apiTerm.js
import apiClient from "../apiClient";

export const getTerms = async ({
  page = 1,
  page_size = 10,
  search = "",
} = {}) => {
  const res = await apiClient.get("/terms/", {
    params: { page, page_size, search },
  });
  return res.data;
};

export const getTermByIdx = async (idx) => {
  const res = await apiClient.get(`/terms/${idx}/`);
  return res.data;
};

export const createTerm = async (data) => {
  const res = await apiClient.post("/terms/", data);
  return res.data;
};

export const updateTerm = async ({ idx, data }) => {
  const res = await apiClient.put(`/terms/${idx}/`, data);
  return res.data;
};

export const deleteTerm = async (idx) => {
  const res = await apiClient.delete(`/terms/${idx}/`);
  return res.data;
};
