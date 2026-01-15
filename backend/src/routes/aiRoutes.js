import express from "express";
import {
  sendMessage,
  getChatHistory,
  getActiveSession,
  clearHistory,
  getSuggestedQuestions,
} from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Chat endpoints
router.post("/chat", sendMessage);
router.get("/history", getChatHistory);
router.get("/session", getActiveSession);
router.delete("/history", clearHistory);
router.get("/suggestions", getSuggestedQuestions);

export default router;
