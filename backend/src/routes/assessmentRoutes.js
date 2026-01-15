import express from "express";
import {
  startAssessment,
  getQuestions,
  saveProgress,
  resumeAssessment,
  submitAssessment,
  getMyAssessments,
  getAssessmentById,
  getAssessmentHistory,
} from "../controllers/assessmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/assessments/start
router.post("/start", startAssessment);

// @route   GET /api/assessments/questions
router.get("/questions", getQuestions);

// @route   GET /api/assessments/resume
router.get("/resume", resumeAssessment);

// @route   GET /api/assessments/history
router.get("/history", getAssessmentHistory);

// @route   GET /api/assessments/my-assessments
router.get("/my-assessments", getMyAssessments);

// @route   GET /api/assessments/:id
router.get("/:id", getAssessmentById);

// @route   PUT /api/assessments/:id/save
router.put("/:id/save", saveProgress);

// @route   POST /api/assessments/:id/submit
router.post("/:id/submit", submitAssessment);

export default router;
