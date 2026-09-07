import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

api.interceptors.request.use((config) => {
  if (!["get", "head", "options", "trace"].includes(
    (config.method || "get").toLowerCase()
  )) {
    const csrfToken =
      getCookie("csrftoken") || getCookie("XSRF-TOKEN");
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem("isLoggedIn");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function ensureCsrf() {
  if (getCookie("csrftoken")) return Promise.resolve();
  return api
    .get("/auth/csrf/")
    .then(() => {})
    .catch(() => {});
}

export function getErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (typeof data.non_field_errors !== "undefined") {
    return Array.isArray(data.non_field_errors)
      ? data.non_field_errors.join(" ")
      : data.non_field_errors;
  }
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const value = data[firstKey];
    const message = Array.isArray(value) ? value.join(" ") : value;
    return `${firstKey} : ${message}`;
  }
  return fallback;
}

export default api;
