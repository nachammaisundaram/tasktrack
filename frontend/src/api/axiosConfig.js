import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log("Token from localStorage:", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Authorization Header:", config.headers.Authorization);
  }

  return config;
});

export default API;