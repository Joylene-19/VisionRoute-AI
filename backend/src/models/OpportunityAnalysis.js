import mongoose from "mongoose";

const opportunityAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Form Input Data
    educationLevel: {
      type: String,
      required: true,
      enum: [
        "10th Pass",
        "12th Pass",
        "Diploma",
        "Bachelor Degree",
        "Master Degree",
      ],
    },

    educationStatus: {
      type: String,
      required: false, // Optional: only for Diploma/Bachelor/Master
      enum: ["Currently Studying", "Completed"],
    },

    familyIncome: {
      type: String,
      required: true,
      enum: ["Below 2 Lakhs", "2-5 Lakhs", "5-8 Lakhs", "Above 8 Lakhs"],
    },

    careerInterest: {
      type: String,
      required: true,
      enum: [
        "Technical",
        "Research",
        "Management",
        "Creative",
        "Government Jobs",
        "Business",
      ],
    },

    // Academic Data (flexible object based on education level)
    academicData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // AI Generated Recommendations
    recommendations: {
      scholarships: [
        {
          type: {
            type: String,
          },
          name: String,
          eligibility: String,
          estimatedAmount: String,
          matchPercentage: Number,
          applicationLink: String,
        },
      ],

      higherEducation: [
        {
          program: String,
          duration: String,
          topColleges: [String],
          careerOutcomes: [String],
          matchPercentage: Number,
          eligibility: String,
        },
      ],

      careerPaths: [
        {
          title: String,
          description: String,
          requiredSkills: [String],
          salaryRange: String,
          growthPotential: String,
          matchPercentage: Number,
          industryDemand: String,
        },
      ],

      skillDevelopment: [
        {
          category: String,
          skills: [String],
          resources: [String],
          priority: String,
          estimatedTime: String,
        },
      ],
    },

    // Metadata
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    regenerationCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
opportunityAnalysisSchema.index({ userId: 1, createdAt: -1 });
opportunityAnalysisSchema.index({ isActive: 1 });

const OpportunityAnalysis = mongoose.model(
  "OpportunityAnalysis",
  opportunityAnalysisSchema,
);

export default OpportunityAnalysis;
