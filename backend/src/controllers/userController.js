import User from "../models/User.js";
import Assessment from "../models/Assessment.js";

// Quote database
const quotes = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Your career journey starts with self-discovery.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Choose a job you love, and you will never have to work a day in your life.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Your passion is waiting for your courage to catch up.",
];

/**
 * Get user dashboard data
 * @route GET /api/user/dashboard
 */
export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Get assessments
    const assessments = await Assessment.find({ user: userId }).sort({
      completedAt: -1,
    });
    const completedAssessments = assessments.filter(
      (a) => a.status === "completed",
    );
    const latestAssessment = completedAssessments[0];

    // Calculate stats
    const assessmentsCompleted = completedAssessments.length;

    // Calculate career matches from latest assessment's AI analysis
    let careerMatches = 0;
    if (latestAssessment && latestAssessment.aiAnalysis?.careerPaths) {
      careerMatches = latestAssessment.aiAnalysis.careerPaths.length;
    }

    // Calculate time spent (sum of all assessment times)
    // If timeSpentMinutes is not set, calculate from timestamps
    const totalMinutes = assessments.reduce((sum, a) => {
      if (a.timeSpentMinutes && a.timeSpentMinutes > 0) {
        return sum + a.timeSpentMinutes;
      }
      // Fallback: calculate from timestamps if completed
      if (a.completedAt && a.createdAt) {
        const duration = Math.floor(
          (new Date(a.completedAt) - new Date(a.createdAt)) / (1000 * 60),
        );
        return sum + duration;
      }
      return sum;
    }, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const timeSpent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    // Calculate profile strength
    const profileStrength = calculateProfileStrength(user);

    // Get recent activity
    const recentActivity = [];

    // Add assessment activities
    completedAssessments.slice(0, 5).forEach((assessment) => {
      recentActivity.push({
        type: "assessment",
        title: "Completed Career Assessment",
        date: assessment.completedAt,
      });
    });

    // Add profile update activity if applicable
    if (user.updatedAt && user.updatedAt > user.createdAt) {
      recentActivity.push({
        type: "profile_update",
        title: "Updated Profile Information",
        date: user.updatedAt,
      });
    }

    // Sort by date
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Get recommended careers from latest assessment's AI analysis
    const recommendedCareers = [];
    if (latestAssessment && latestAssessment.aiAnalysis?.careerPaths) {
      latestAssessment.aiAnalysis.careerPaths.slice(0, 3).forEach((career) => {
        recommendedCareers.push({
          title: career.title || career.career,
          description:
            career.description ||
            "Exciting career opportunity based on your profile",
          match: career.matchScore || career.matchPercentage || 90,
        });
      });
    }

    // Random quote of the day
    const quoteOfDay = quotes[Math.floor(Math.random() * quotes.length)];

    const dashboardData = {
      user: {
        name: user.name || user.displayName,
        email: user.email,
        profileCompletion: profileStrength,
      },
      stats: {
        assessmentsCompleted,
        careerMatches,
        timeSpent,
        profileStrength,
      },
      recentActivity: recentActivity.slice(0, 5),
      recommendedCareers,
      quoteOfDay,
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
};

/**
 * Calculate profile completion strength
 */
const calculateProfileStrength = (user) => {
  let score = 0;
  const fields = [
    "name",
    "email",
    "phone",
    "currentGrade",
    "gender",
    "school",
    "city",
    "state",
    "dateOfBirth",
  ];

  fields.forEach((field) => {
    if (user[field] && user[field].toString().trim() !== "") {
      score += 100 / fields.length;
    }
  });

  return Math.round(score);
};
