import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV
      ? "http://localhost:8000/api"
      : "https://your-production-url/api"),
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  withCredentials: true,
});

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

export default api;