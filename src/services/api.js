import axios from "axios";

function resolveApiBase() {
  const fromEnv = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://localhost:8080/api";
  return "";
}

const api = axios.create({
  baseURL: resolveApiBase(),
  timeout: 15000,
  headers: { "Content-Type": "application/json" }
});

// Turns any Axios error into a message that is safe to show to the user.
export function errorMessage(err) {
  if (err.response) {
    const d = err.response.data;
    if (d && d.fieldErrors && Object.keys(d.fieldErrors).length > 0) {
      return Object.values(d.fieldErrors).join(" ");
    }
    return (d && d.message) || `Server error (${err.response.status}).`;
  }
  if (err.request) {
    return "Cannot reach the server. Check that the API is running and VITE_API_URL is set.";
  }
  return err.message || "Something went wrong.";
}

export default api;
