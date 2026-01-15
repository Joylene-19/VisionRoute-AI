import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "assessment_completed",
        "career_match",
        "profile_updated",
        "system",
        "welcome",
        "reminder",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: "Bell",
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying of unread notifications
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

// Static method to create a notification
notificationSchema.statics.createNotification = async function (
  userId,
  type,
  title,
  message,
  link = null,
  icon = "Bell",
  priority = "medium"
) {
  return await this.create({
    userId,
    type,
    title,
    message,
    link,
    icon,
    priority,
  });
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function () {
  this.read = true;
  return await this.save();
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
