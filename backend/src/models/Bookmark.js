import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    careerTitle: {
      type: String,
      required: true,
      trim: true,
    },
    careerDescription: {
      type: String,
      trim: true,
    },
    matchPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    category: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate bookmarks
bookmarkSchema.index({ user: 1, careerTitle: 1 }, { unique: true });

// Index for faster queries
bookmarkSchema.index({ user: 1, createdAt: -1 });

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

export default Bookmark;
