import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllAssessments,
  getAssessmentById,
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAnalyticsData,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Dashboard
router.get("/dashboard/stats", getDashboardStats);

// Analytics
router.get("/analytics", getAnalyticsData);

// User Management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Assessment Management
router.get("/assessments", getAllAssessments);
router.get("/assessments/:id", getAssessmentById);

// Question Management
router.get("/questions", getAllQuestions);
router.post("/questions", createQuestion);
router.put("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);

export default router;
