import axios from "axios";
import { useKycStore } from "../app/store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Add a request interceptor to inject the JWT token
api.interceptors.request.use(
  (config) => {
    // Get token from Zustand store
    const token = useKycStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and user on unauthorized
      useKycStore.getState().logout();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
