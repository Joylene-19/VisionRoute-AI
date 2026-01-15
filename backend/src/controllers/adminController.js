import User from "../models/User.js";
import Assessment from "../models/Assessment.js";
import Question from "../models/Question.js";

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard/stats
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();

    // Get total assessments count
    const totalAssessments = await Assessment.countDocuments();

    // Get completed assessments count
    const completedAssessments = await Assessment.countDocuments({
      status: "completed",
    });

    // Get active users (logged in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: sevenDaysAgo },
    });

    // Get recent users (last 10)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name email createdAt role");

    // Get recent assessments (last 10)
    const recentAssessments = await Assessment.find()
      .populate("user", "name email")
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("user status totalQuestions answeredQuestions updatedAt");

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAssessments,
        completedAssessments,
        activeUsers,
        recentUsers,
        recentAssessments,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all users with filters and pagination
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "",
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // Build query
    const query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Count total documents
    const total = await User.countDocuments(query);

    // Get users with pagination
    const users = await User.find(query)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select("-password -resetPasswordToken -emailVerificationToken");

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

/**
 * @desc    Get user by ID with assessments
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("assessments")
      .select("-password -resetPasswordToken -emailVerificationToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'user' or 'admin'",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete user's assessments
    await Assessment.deleteMany({ user: user._id });

    // Delete user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User and associated data deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all assessments with filters
 * @route   GET /api/admin/assessments
 * @access  Private/Admin
 */
export const getAllAssessments = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = "",
      sortBy = "updatedAt",
      order = "desc",
    } = req.query;

    // Build query
    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Count total documents
    const total = await Assessment.countDocuments(query);

    // Get assessments with pagination
    const assessments = await Assessment.find(query)
      .populate("user", "name email profilePhoto")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    console.log("📊 Sample assessment user data:", assessments[0]?.user);

    res.status(200).json({
      success: true,
      data: {
        assessments,
        pagination: {
          total,
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all assessments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assessments",
      error: error.message,
    });
  }
};

/**
 * @desc    Get assessment by ID (admin can view any assessment)
 * @route   GET /api/admin/assessments/:id
 * @access  Private/Admin
 */
export const getAssessmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log("🔍 Fetching assessment with ID:", id);

    const assessment = await Assessment.findById(id)
      .populate("user", "name email profilePhoto currentGrade phone")
      .lean();

    console.log("📋 Found assessment:", assessment ? "Yes" : "No");
    console.log("👤 User data:", assessment?.user);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    console.error("Get assessment by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assessment",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all questions
 * @route   GET /api/admin/questions
 * @access  Private/Admin
 */
export const getAllQuestions = async (req, res, next) => {
  try {
    const { category = "", isActive = "" } = req.query;

    // Build query
    const query = {};

    if (category) {
      query.category = category;
    }

    if (isActive !== "") {
      query.isActive = isActive === "true";
    }

    const questions = await Question.find(query).sort({
      category: 1,
      order: 1,
    });

    res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error("Get all questions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
      error: error.message,
    });
  }
};

/**
 * @desc    Create new question
 * @route   POST /api/admin/questions
 * @access  Private/Admin
 */
export const createQuestion = async (req, res, next) => {
  try {
    const question = await Question.create(req.body);

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: question,
    });
  } catch (error) {
    console.error("Create question error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create question",
      error: error.message,
    });
  }
};

/**
 * @desc    Update question
 * @route   PUT /api/admin/questions/:id
 * @access  Private/Admin
 */
export const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: question,
    });
  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update question",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete question
 * @route   DELETE /api/admin/questions/:id
 * @access  Private/Admin
 */
export const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Delete question error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete question",
      error: error.message,
    });
  }
};

/**
 * @desc    Get analytics data for charts
 * @route   GET /api/admin/analytics
 * @access  Private/Admin
 */
export const getAnalyticsData = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // User growth data
    const userGrowthData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          users: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Assessment growth data
    const assessmentGrowthData = await Assessment.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          assessments: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Combine user and assessment growth
    const dateMap = new Map();
    userGrowthData.forEach((item) => {
      dateMap.set(item._id, {
        date: item._id,
        users: item.users,
        assessments: 0,
      });
    });
    assessmentGrowthData.forEach((item) => {
      const existing = dateMap.get(item._id) || {
        date: item._id,
        users: 0,
        assessments: 0,
      };
      existing.assessments = item.assessments;
      dateMap.set(item._id, existing);
    });
    const userGrowth = Array.from(dateMap.values()).map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      users: item.users,
      assessments: item.assessments,
    }));

    // Assessment status distribution
    const totalAssessments = await Assessment.countDocuments();
    const completedCount = await Assessment.countDocuments({
      status: "completed",
    });
    const inProgressCount = await Assessment.countDocuments({
      status: "in-progress",
    });
    const totalUsers = await User.countDocuments();
    const notStartedCount = Math.max(0, totalUsers - totalAssessments);

    const assessmentStatus = [
      { name: "Completed", value: completedCount, color: "#10b981" },
      { name: "In Progress", value: inProgressCount, color: "#f59e0b" },
      { name: "Not Started", value: notStartedCount, color: "#6b7280" },
    ];

    // Top career matches (from completed assessments)
    const completedAssessments = await Assessment.find({ status: "completed" })
      .select("careerRecommendations")
      .lean();

    const careerCounts = {};
    completedAssessments.forEach((assessment) => {
      if (
        assessment.careerRecommendations &&
        Array.isArray(assessment.careerRecommendations)
      ) {
        assessment.careerRecommendations.slice(0, 3).forEach((career) => {
          const careerName =
            typeof career === "string" ? career : career.title || career.name;
          if (careerName) {
            careerCounts[careerName] = (careerCounts[careerName] || 0) + 1;
          }
        });
      }
    });

    const topCareers = Object.entries(careerCounts)
      .map(([career, count]) => ({ career, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // RIASEC score distribution
    const riasecStats = await Assessment.aggregate([
      { $match: { status: "completed", "scores.interest": { $exists: true } } },
      {
        $group: {
          _id: null,
          realistic: { $avg: "$scores.interest.realistic" },
          investigative: { $avg: "$scores.interest.investigative" },
          artistic: { $avg: "$scores.interest.artistic" },
          social: { $avg: "$scores.interest.social" },
          enterprising: { $avg: "$scores.interest.enterprising" },
          conventional: { $avg: "$scores.interest.conventional" },
        },
      },
    ]);

    const riasecDistribution =
      riasecStats.length > 0
        ? [
            {
              dimension: "Realistic",
              average: Math.round(riasecStats[0].realistic || 0),
            },
            {
              dimension: "Investigative",
              average: Math.round(riasecStats[0].investigative || 0),
            },
            {
              dimension: "Artistic",
              average: Math.round(riasecStats[0].artistic || 0),
            },
            {
              dimension: "Social",
              average: Math.round(riasecStats[0].social || 0),
            },
            {
              dimension: "Enterprising",
              average: Math.round(riasecStats[0].enterprising || 0),
            },
            {
              dimension: "Conventional",
              average: Math.round(riasecStats[0].conventional || 0),
            },
          ]
        : [];

    // Aptitude score averages
    const aptitudeStats = await Assessment.aggregate([
      { $match: { status: "completed", "scores.aptitude": { $exists: true } } },
      {
        $group: {
          _id: null,
          logical: { $avg: "$scores.aptitude.logical" },
          numerical: { $avg: "$scores.aptitude.numerical" },
          verbal: { $avg: "$scores.aptitude.verbal" },
          spatial: { $avg: "$scores.aptitude.spatial" },
        },
      },
    ]);

    const aptitudeAverages =
      aptitudeStats.length > 0
        ? [
            {
              skill: "Logical",
              average: Math.round(aptitudeStats[0].logical || 0),
            },
            {
              skill: "Numerical",
              average: Math.round(aptitudeStats[0].numerical || 0),
            },
            {
              skill: "Verbal",
              average: Math.round(aptitudeStats[0].verbal || 0),
            },
            {
              skill: "Spatial",
              average: Math.round(aptitudeStats[0].spatial || 0),
            },
          ]
        : [];

    res.status(200).json({
      success: true,
      data: {
        userGrowth,
        assessmentStatus,
        topCareers,
        riasecDistribution,
        aptitudeAverages,
      },
    });
  } catch (error) {
    console.error("Get analytics data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
      error: error.message,
    });
  }
};

export default {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllAssessments,
  getAssessmentById,
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAnalyticsData,
};
