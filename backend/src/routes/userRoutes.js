import express from "express";
import { getUserDashboard } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user dashboard data
router.get("/dashboard", getUserDashboard);

export default router;
