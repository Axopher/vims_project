// src/services/refreshClient.js
import axios from "axios";
import { getTenantFromUrl } from "../utils/getTenant";

const tenant = getTenantFromUrl();
const API_BASE_DOMAIN = import.meta.env.VITE_API_BASE_DOMAIN;

// Dedicated client for refresh requests only
export const refreshClient = axios.create({
  baseURL: `http://${tenant}.${API_BASE_DOMAIN}/api`,
  headers: { "Content-Type": "application/json" },
});
