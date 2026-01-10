import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import useAuthStore from "../store/authStore";

/**
 * Create Axios instance with default config
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

/**
 * Request Interceptor
 * Add auth token to every request
 */
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle errors globally
 */
api.interceptors.response.use(
  (response) => {
    return response.data; // Return only data
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Unauthorized - logout user
      if (status === 401) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }

      // Return the full error for better handling
      return Promise.reject(error);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject(
        new Error("Network error. Please check your connection.")
      );
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  }
);

export default api;
