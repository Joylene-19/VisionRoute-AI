import express from "express";
import {
  submitAnalysis,
  getAnalysisHistory,
  getAnalysisById,
  regenerateAnalysis,
  deleteAnalysis,
} from "../controllers/opportunityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Submit new opportunity analysis
router.post("/", submitAnalysis);

// Get analysis history for logged-in user
router.get("/history", getAnalysisHistory);

// Get specific analysis by ID
router.get("/:id", getAnalysisById);

// Regenerate analysis with new AI recommendations
router.post("/:id/regenerate", regenerateAnalysis);

// Delete analysis (soft delete)
router.delete("/:id", deleteAnalysis);

export default router;
