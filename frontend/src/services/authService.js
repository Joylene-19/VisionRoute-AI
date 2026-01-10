import api from "./api";
import { API_ENDPOINTS } from "../utils/constants";

/**
 * Authentication Service
 * All auth-related API calls
 */

/**
 * Register new user
 */
export const registerUser = async (userData) => {
  return await api.post(API_ENDPOINTS.REGISTER, userData);
};

/**
 * Login with email and password
 */
export const loginUser = async (credentials) => {
  return await api.post(API_ENDPOINTS.LOGIN, credentials);
};

/**
 * Login with Google OAuth
 */
export const googleLogin = async (googleData) => {
  return await api.post(API_ENDPOINTS.GOOGLE_AUTH, googleData);
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  return await api.get(API_ENDPOINTS.GET_ME);
};

/**
 * Update user profile
 */
export const updateUserProfile = async (updates) => {
  return await api.put(API_ENDPOINTS.UPDATE_PROFILE, updates);
};

/**
 * Change password
 */
export const changePassword = async (passwordData) => {
  return await api.put(API_ENDPOINTS.CHANGE_PASSWORD, passwordData);
};

/**
 * Logout user
 */
export const logoutUser = async () => {
  return await api.post(API_ENDPOINTS.LOGOUT);
};
