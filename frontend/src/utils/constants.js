/**
 * API Endpoints Constants
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: "/api/auth/register",
  LOGIN: "/api/auth/login",
  GOOGLE_AUTH: "/api/auth/google",
  GET_ME: "/api/auth/me",
  UPDATE_PROFILE: "/api/auth/profile",
  CHANGE_PASSWORD: "/api/auth/password",
  LOGOUT: "/api/auth/logout",

  // Assessment endpoints (for future modules)
  ASSESSMENTS: "/api/assessments",
  SUBMIT_ASSESSMENT: "/api/assessments/submit",

  // AI endpoints (for future modules)
  GENERATE_RESULTS: "/api/ai/generate",

  // Admin endpoints (for future modules)
  ADMIN_USERS: "/api/admin/users",
  ADMIN_QUESTIONS: "/api/admin/questions",
};

/**
 * App Constants
 */
export const GRADE_OPTIONS = [
  { value: "9th", label: "9th Grade" },
  { value: "10th", label: "10th Grade" },
  { value: "11th", label: "11th Grade" },
  { value: "12th", label: "12th Grade" },
  { value: "College", label: "College" },
  { value: "Graduate", label: "Graduate" },
  { value: "Other", label: "Other" },
];

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const STREAM_OPTIONS = [
  { value: "science", label: "Science", color: "#3B82F6" },
  { value: "commerce", label: "Commerce", color: "#10B981" },
  { value: "arts", label: "Arts", color: "#8B5CF6" },
  { value: "vocational", label: "Vocational", color: "#F59E0B" },
];
