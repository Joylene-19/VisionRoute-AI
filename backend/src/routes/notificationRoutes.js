import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  createNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all notifications
router.get("/", getNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark all as read
router.patch("/mark-all-read", markAllAsRead);

// Clear read notifications
router.delete("/clear-read", clearReadNotifications);

// Create notification (admin or self)
router.post("/", createNotification);

// Mark single notification as read
router.patch("/:id/read", markAsRead);

// Delete single notification
router.delete("/:id", deleteNotification);

export default router;
