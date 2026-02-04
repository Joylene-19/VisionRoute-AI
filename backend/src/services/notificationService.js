import Notification from "../models/Notification.js";

/**
 * Notification Service
 * Helper functions to create notifications for various events
 */

/**
 * Create a notification for a user
 * @param {Object} params - Notification parameters
 * @param {String} params.userId - User ID
 * @param {String} params.type - Notification type
 * @param {String} params.title - Notification title
 * @param {String} params.message - Notification message
 * @param {String} params.link - Optional link
 * @param {String} params.icon - Optional icon name
 * @param {String} params.priority - Optional priority (low, medium, high)
 * @returns {Promise<Notification>}
 */
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  link = null,
  icon = "Bell",
  priority = "medium",
}) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      link,
      icon,
      priority,
    });

    console.log(`✅ Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    console.error("❌ Failed to create notification:", error);
    throw error;
  }
};

/**
 * Send welcome notification to new user
 * @param {String} userId - User ID
 * @param {String} userName - User's name
 * @returns {Promise<Notification>}
 */
export const sendWelcomeNotification = async (userId, userName) => {
  return createNotification({
    userId,
    type: "welcome",
    title: `Welcome to VisionRoute AI!`,
    message: `Hi ${userName}! We're excited to help you discover your perfect career path. Start by taking your first assessment!`,
    link: "/assessment",
    icon: "Sparkles",
    priority: "high",
  });
};

/**
 * Send assessment completion notification
 * @param {String} userId - User ID
 * @param {String} assessmentId - Assessment ID
 * @param {Number} careerMatches - Number of career matches found
 * @returns {Promise<Notification>}
 */
export const sendAssessmentCompleteNotification = async (
  userId,
  assessmentId,
  careerMatches = 0
) => {
  return createNotification({
    userId,
    type: "assessment_completed",
    title: "Assessment Complete!",
    message: `Great job! Your career assessment is complete. We found ${careerMatches} career matches for you. View your results now!`,
    link: `/results/${assessmentId}`,
    icon: "CheckCircle",
    priority: "high",
  });
};

/**
 * Send career match notification
 * @param {String} userId - User ID
 * @param {Array} topCareers - Array of top career matches
 * @returns {Promise<Notification>}
 */
export const sendCareerMatchNotification = async (userId, topCareers = []) => {
  const careerList = topCareers
    .slice(0, 3)
    .map((c) => c.title)
    .join(", ");

  return createNotification({
    userId,
    type: "career_match",
    title: "New Career Matches Found!",
    message: `Based on your latest assessment, we recommend: ${careerList}. Explore these careers in detail!`,
    link: "/results",
    icon: "Briefcase",
    priority: "medium",
  });
};

/**
 * Send profile completion reminder
 * @param {String} userId - User ID
 * @param {Number} completionPercentage - Profile completion percentage
 * @returns {Promise<Notification>}
 */
export const sendProfileReminderNotification = async (
  userId,
  completionPercentage
) => {
  return createNotification({
    userId,
    type: "reminder",
    title: "Complete Your Profile",
    message: `Your profile is ${completionPercentage}% complete. Add more details to get better career recommendations!`,
    link: "/profile",
    icon: "User",
    priority: "low",
  });
};

/**
 * Send assessment reminder notification
 * @param {String} userId - User ID
 * @returns {Promise<Notification>}
 */
export const sendAssessmentReminderNotification = async (userId) => {
  return createNotification({
    userId,
    type: "reminder",
    title: "Time for a New Assessment?",
    message: `It's been a while since your last assessment. Your interests may have changed - take a new assessment to get updated recommendations!`,
    link: "/assessment",
    icon: "ClipboardList",
    priority: "low",
  });
};

/**
 * Send system announcement notification
 * @param {String} userId - User ID (or 'all' for broadcast)
 * @param {String} title - Announcement title
 * @param {String} message - Announcement message
 * @param {String} link - Optional link
 * @returns {Promise<Notification>}
 */
export const sendSystemNotification = async (
  userId,
  title,
  message,
  link = null
) => {
  return createNotification({
    userId,
    type: "system",
    title,
    message,
    link,
    icon: "Info",
    priority: "medium",
  });
};

/**
 * Send profile update confirmation
 * @param {String} userId - User ID
 * @returns {Promise<Notification>}
 */
export const sendProfileUpdateNotification = async (userId) => {
  return createNotification({
    userId,
    type: "profile_updated",
    title: "Profile Updated Successfully",
    message: `Your profile has been updated. This will help us provide more accurate career recommendations!`,
    link: "/profile",
    icon: "CheckCircle",
    priority: "low",
  });
};

/**
 * Send bookmark notification
 * @param {String} userId - User ID
 * @param {String} careerTitle - Career title
 * @returns {Promise<Notification>}
 */
export const sendBookmarkNotification = async (userId, careerTitle) => {
  return createNotification({
    userId,
    type: "career_match",
    title: "Career Bookmarked!",
    message: `You've bookmarked "${careerTitle}". Check your bookmarks to review all saved careers.`,
    link: "/bookmarks",
    icon: "Bookmark",
    priority: "low",
  });
};

/**
 * Bulk create notifications for multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Array>}
 */
export const sendBulkNotifications = async (userIds, notificationData) => {
  try {
    const notifications = userIds.map((userId) => ({
      userId,
      ...notificationData,
    }));

    const result = await Notification.insertMany(notifications);
    console.log(`✅ Bulk notifications sent to ${userIds.length} users`);
    return result;
  } catch (error) {
    console.error("❌ Failed to send bulk notifications:", error);
    throw error;
  }
};

export default {
  createNotification,
  sendWelcomeNotification,
  sendAssessmentCompleteNotification,
  sendCareerMatchNotification,
  sendProfileReminderNotification,
  sendAssessmentReminderNotification,
  sendSystemNotification,
  sendProfileUpdateNotification,
  sendBookmarkNotification,
  sendBulkNotifications,
};
