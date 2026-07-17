import axios from "axios";

const DEFAULT_API_URL = import.meta.env.DEV
  ? "http://localhost:5000/api"
  : "https://dailyforge-backend.onrender.com/api";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  DEFAULT_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error(
        "Request timed out. The server may be waking up from sleep. Please wait a moment and try again."
      );
      error.userMessage =
        "The server is waking up - this can take up to 30 seconds on first load. Please try again shortly.";
    } else if (!error.response) {
      console.error("Network error. Please check your connection.");
      error.userMessage = "Network error. Please check your internet connection.";
    }

    return Promise.reject(error);
  }
);

export default api;
