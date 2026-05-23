import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 30000,
});

// Attach token automatically
api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  // safer token check
  if (
    token &&
    token !== "undefined" &&
    token !== "null"
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,

  (error) => {

    console.error("Axios Error:", error);

    if (error.code === "ECONNABORTED") {

      error.userMessage =
        "Server timeout. Please try again.";

    } else if (!error.response) {

      error.userMessage =
        "Network error. Backend not running.";
    }

    return Promise.reject(error);
  }
);

export default api;