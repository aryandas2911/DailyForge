import axios from "axios";

// create axios instance
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api/",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error(
        "Request timed out. The server may be waking up from sleep."
      );

      error.userMessage =
        "The server is waking up — please try again shortly.";
    } else if (!error.response) {
      console.error("Network error.");
      error.userMessage = "Network error. Please check your internet connection.";
    }

    return Promise.reject(error);
  }
);

export default api;