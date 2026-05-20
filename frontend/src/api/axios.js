import axios from "axios";

// create axios instance
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV
      ? "http://localhost:8000/api"
      : "https://dailyforge-backend.onrender.com/api/"),

  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,

  withCredentials: true,
});

// attach Authorization header automatically
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  } catch (error) {
    return config;
  }
});

// handle response errors
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error(
        "Request timed out. The server may be waking up from sleep."
      );

      error.userMessage =
        "The server is waking up — this can take up to 30 seconds on first load. Please try again shortly.";
    } else if (!error.response) {
      console.error("Network error. Please check your connection.");

      error.userMessage =
        "Network error. Please check your internet connection.";
    }

    return Promise.reject(error);
  }
);

export default api;
