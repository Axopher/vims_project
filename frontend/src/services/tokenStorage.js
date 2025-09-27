// src/services/tokenStorage.js
const STORAGE_KEY = "auth";

export const getCred = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Invalid auth data in local storage:", err);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const setCred = (auth) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
};

export const clearCred = () => {
  localStorage.removeItem(STORAGE_KEY);
};
