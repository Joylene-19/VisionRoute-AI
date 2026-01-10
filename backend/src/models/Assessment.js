import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    // User Reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Assessment Status
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "abandoned"],
      default: "not_started",
    },

    // Responses Array
    responses: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        answer: {
          type: mongoose.Schema.Types.Mixed, // Can be string, number, or array
          required: true,
        },
        score: {
          type: Number,
          default: 0,
        },
        answeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Progress Tracking
    currentStep: {
      type: Number,
      default: 0,
    },
    currentCategory: {
      type: String,
      enum: ["interest", "aptitude", "personality", "academic"],
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    questionsAnswered: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 85,
    },

    // Category Progress
    categoryProgress: {
      interest: {
        total: { type: Number, default: 20 },
        answered: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
      },
      aptitude: {
        total: { type: Number, default: 25 },
        answered: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
      },
      personality: {
        total: { type: Number, default: 20 },
        answered: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
      },
      academic: {
        total: { type: Number, default: 20 },
        answered: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
      },
    },

    // Time Tracking
    startedAt: {
      type: Date,
    },
    lastSavedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    timeSpentMinutes: {
      type: Number,
      default: 0,
    },

    // Scores (calculated after completion)
    scores: {
      interest: {
        realistic: { type: Number, default: 0 },
        investigative: { type: Number, default: 0 },
        artistic: { type: Number, default: 0 },
        social: { type: Number, default: 0 },
        enterprising: { type: Number, default: 0 },
        conventional: { type: Number, default: 0 },
      },
      aptitude: {
        logical: { type: Number, default: 0 },
        numerical: { type: Number, default: 0 },
        verbal: { type: Number, default: 0 },
        spatial: { type: Number, default: 0 },
        abstract: { type: Number, default: 0 },
      },
      personality: {
        openness: { type: Number, default: 0 },
        conscientiousness: { type: Number, default: 0 },
        extraversion: { type: Number, default: 0 },
        agreeableness: { type: Number, default: 0 },
        stability: { type: Number, default: 0 },
      },
      academic: {
        science: { type: Number, default: 0 },
        commerce: { type: Number, default: 0 },
        arts: { type: Number, default: 0 },
        vocational: { type: Number, default: 0 },
      },
    },

    // Result Reference (after AI processing)
    result: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Result",
    },

    // AI-Generated Career Analysis
    aiAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    aiAnalysisGeneratedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
assessmentSchema.index({ user: 1, status: 1 });
assessmentSchema.index({ createdAt: -1 });

// Methods
assessmentSchema.methods.calculateProgress = function () {
  this.completionPercentage = Math.round(
    (this.questionsAnswered / this.totalQuestions) * 100
  );
};

assessmentSchema.methods.updateCategoryProgress = function () {
  const categories = ["interest", "aptitude", "personality", "academic"];

  categories.forEach((category) => {
    const categoryResponses = this.responses.filter(
      (r) => r.questionId?.category === category
    );
    this.categoryProgress[category].answered = categoryResponses.length;
    this.categoryProgress[category].completed =
      categoryResponses.length >= this.categoryProgress[category].total;
  });
};

const Assessment = mongoose.model("Assessment", assessmentSchema);

export default Assessment;
