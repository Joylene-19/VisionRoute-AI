import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [messageSchema],
    context: {
      assessmentResults: {
        type: Object,
        default: null,
      },
      careerInterests: [String],
      aptitudeScores: {
        type: Object,
        default: null,
      },
      userProfile: {
        currentGrade: String,
        stream: String,
        subjects: [String],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
chatHistorySchema.index({ userId: 1, sessionId: 1 });
chatHistorySchema.index({ userId: 1, isActive: 1, updatedAt: -1 });

// Static method to get or create active session
chatHistorySchema.statics.getActiveSession = async function (userId) {
  let session = await this.findOne({
    userId,
    isActive: true,
  }).sort({ updatedAt: -1 });

  if (!session) {
    session = await this.create({
      userId,
      sessionId: `session_${Date.now()}`,
      messages: [],
      context: {},
    });
  }

  return session;
};

// Instance method to add message
chatHistorySchema.methods.addMessage = async function (role, content) {
  this.messages.push({ role, content });
  this.updatedAt = new Date();
  return await this.save();
};

// Instance method to get conversation history for AI context
chatHistorySchema.methods.getConversationContext = function (limit = 10) {
  // Get last N messages for context
  const recentMessages = this.messages.slice(-limit);
  return recentMessages.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));
};

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);

export default ChatHistory;
