import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, X, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications when opened
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/notifications?limit=10");
      setNotifications(response?.notifications || []);
      setUnreadCount(response?.unreadCount || 0);
    } catch (error) {
      // Silently fail - notification feature might not be fully set up
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/api/notifications/unread-count");
      setUnreadCount(response?.unreadCount || 0);
    } catch (error) {
      // Silently fail - notification feature might not be fully set up
      setUnreadCount(0);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/api/notifications/mark-all-read");
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      assessment_completed: "✅",
      career_match: "🎯",
      profile_updated: "👤",
      system: "⚙️",
      welcome: "👋",
      reminder: "⏰",
    };
    return iconMap[type] || "🔔";
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      high: "text-red-500 dark:text-red-400",
      medium: "text-blue-500 dark:text-blue-400",
      low: "text-gray-500 dark:text-gray-400",
    };
    return colorMap[priority] || colorMap.medium;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                    title="Mark all as read"
                  >
                    <CheckCheck size={16} />
                    <span className="hidden sm:inline">Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        !notification.read
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          <span className="text-2xl">
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p
                                className={`text-sm font-semibold ${
                                  notification.read
                                    ? "text-gray-700 dark:text-gray-300"
                                    : "text-gray-900 dark:text-white"
                                }`}
                              >
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {formatDistanceToNow(
                                  new Date(notification.createdAt),
                                  { addSuffix: true }
                                )}
                              </p>
                            </div>

                            {/* Priority Badge */}
                            <span
                              className={`flex-shrink-0 ml-2 ${getPriorityColor(
                                notification.priority
                              )}`}
                            >
                              <div className="w-2 h-2 rounded-full bg-current"></div>
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-3 mt-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                              >
                                <Check size={12} />
                                <span>Mark as read</span>
                              </button>
                            )}
                            <button
                              onClick={() =>
                                deleteNotification(notification._id)
                              }
                              className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center space-x-1"
                            >
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-dark-border">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Could navigate to a full notifications page
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline w-full text-center"
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
