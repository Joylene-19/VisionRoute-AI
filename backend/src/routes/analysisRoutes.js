import express from "express";
import {
  generateAnalysis,
  getAnalysis,
  getMyAnalyses,
} from "../controllers/analysisController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/analysis/:assessmentId/generate
// @desc    Generate AI career analysis for completed assessment
router.post("/:assessmentId/generate", generateAnalysis);

// @route   GET /api/analysis/:assessmentId
// @desc    Get existing AI analysis
router.get("/:assessmentId", getAnalysis);

// @route   GET /api/analysis/my-analyses
// @desc    Get all user's analyses
router.get("/", getMyAnalyses);

export default router;
