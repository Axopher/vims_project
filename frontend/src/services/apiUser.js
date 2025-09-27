// src/services/user.js
import apiClient from "./apiClient";

export const getMe = async () => {
  const res = await apiClient.get("/accounts/my/");
  return res.data;
};
