// src/services/auth.js
import apiClient from "./apiClient";
import { refreshClient } from "./apiRefreshClient";

export const activateAccount = async ({ uid, token, password }) => {
  const res = await apiClient.post(`/accounts/activate/${uid}/${token}/`, {
    password,
  });
  return res.data;
};

export const login = async ({ email, password }) => {
  const res = await apiClient.post("/accounts/login/", { email, password });
  return res.data;
};

export const logout = async () => {
  // Optional API logout in future, backend supports blacklisting
  // await apiClient.post("/accounts/logout/").catch(() => {});
  return true;
};

export const refreshToken = async (refresh) => {
  const res = await refreshClient.post("/accounts/refresh_token/", { refresh });
  return res.data;
};
