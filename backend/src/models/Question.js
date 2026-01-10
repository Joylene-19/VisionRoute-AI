import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    // Question Information
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["interest", "aptitude", "personality", "academic"],
    },
    subcategory: {
      type: String,
      trim: true,
    },

    // Question Type
    questionType: {
      type: String,
      required: [true, "Question type is required"],
      enum: ["multiple_choice", "rating_scale", "yes_no", "ranking"],
      default: "multiple_choice",
    },

    // Options (for MCQ, ranking)
    options: [
      {
        text: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
        score: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Scoring Information
    scoringType: {
      type: String,
      enum: [
        "riasec",
        "big_five",
        "aptitude",
        "preference",
        "personality",
        "academic",
      ],
    },
    scoringKey: {
      type: String, // e.g., 'realistic', 'logical', 'science'
    },
    maxScore: {
      type: Number,
      default: 5,
    },

    // Display Settings
    order: {
      type: Number,
      required: true,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    helpText: {
      type: String,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
questionSchema.index({ category: 1, order: 1 });
questionSchema.index({ isActive: 1 });

const Question = mongoose.model("Question", questionSchema);

export default Question;
