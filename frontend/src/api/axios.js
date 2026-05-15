import axios from "axios";

// create axios instance
const api = axios.create({
  baseURL: "https://dailyforge-backend.onrender.com/api/",
  timeout: 2000,
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

export default api;
