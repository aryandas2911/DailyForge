import axios from "axios";

// create axios instance
const api = axios.create({
  baseURL: "https://dailyforge-backend.onrender.com/api/",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000, // updated 15s as default
});

// attach jwt automatically with each request
api.interceptors.request.use((config) => {
  try {
    // Read token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, attach the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    // Handle error
    console.log(error);
    return Promise.reject(error);
  }
});

// Handle response errors, including timeout
api.interceptors.response.use(
  (response) => response, // success — pass through unchanged
  (error) => {
    if (error.code === "ECONNABORTED") {
      // This fires when the timeout is hit
      console.error("Request timed out. The server may be waking up from sleep. Please wait a moment and try again.");
      error.userMessage =
        "The server is waking up — this can take up to 30 seconds on first load. Please try again shortly.";
    } else if (!error.response) {
      // Network error (no internet, server completely unreachable)
      console.error("Network error. Please check your connection.");
      error.userMessage = "Network error. Please check your internet connection.";
    }
    return Promise.reject(error); // always reject so callers can handle it
  }
);

export default api;