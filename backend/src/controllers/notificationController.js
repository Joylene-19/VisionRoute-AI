import Notification from "../models/Notification.js";
import asyncHandler from "express-async-handler";

// Notification Controller
// @desc    Get all notifications for authenticated user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  const query = { userId: req.user._id };
  if (unreadOnly === "true") {
    query.read = false;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    read: false,
  });

  res.json({
    notifications,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalNotifications: total,
    unreadCount,
  });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    read: false,
  });

  res.json({ unreadCount });
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  notification.read = true;
  await notification.save();

  res.json({ message: "Notification marked as read", notification });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/mark-all-read
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { userId: req.user._id, read: false },
    { $set: { read: true } }
  );

  res.json({
    message: "All notifications marked as read",
    modifiedCount: result.modifiedCount,
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  await notification.deleteOne();

  res.json({ message: "Notification deleted" });
});

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/clear-read
// @access  Private
export const clearReadNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({
    userId: req.user._id,
    read: true,
  });

  res.json({
    message: "Read notifications cleared",
    deletedCount: result.deletedCount,
  });
});

// @desc    Create a notification (for system use)
// @route   POST /api/notifications
// @access  Private/Admin
export const createNotification = asyncHandler(async (req, res) => {
  const { userId, type, title, message, link, icon, priority } = req.body;

  // Only admins can create notifications for other users
  if (req.user.role !== "admin" && userId !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to create notifications for other users");
  }

  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    link,
    icon,
    priority,
  });

  res.status(201).json(notification);
});
