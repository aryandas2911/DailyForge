import axios from "axios";

// create axios instance
const api = axios.create({
  baseURL: import.meta.env.DEV ? "http://localhost:5000/api/" : "https://dailyforge-backend.onrender.com/api/",
  timeout: 5000,
  withCredentials: true,
});

export default api;
