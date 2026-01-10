import Assessment from "../models/Assessment.js";
import Question from "../models/Question.js";

// @desc    Start a new assessment
// @route   POST /api/assessments/start
// @access  Private
export const startAssessment = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Check if user already has an in-progress assessment
    const existingAssessment = await Assessment.findOne({
      user: userId,
      status: { $in: ["not_started", "in_progress"] },
    });

    if (existingAssessment) {
      return res.status(200).json({
        success: true,
        message: "You have an existing assessment in progress",
        data: existingAssessment,
      });
    }

    // Create new assessment
    const assessment = await Assessment.create({
      user: userId,
      status: "in_progress",
      currentStep: 1,
      currentCategory: "interest",
      startedAt: new Date(),
      categoryProgress: {
        interest: { total: 20, answered: 0, completed: false },
        aptitude: { total: 25, answered: 0, completed: false },
        personality: { total: 20, answered: 0, completed: false },
        academic: { total: 20, answered: 0, completed: false },
      },
    });

    res.status(201).json({
      success: true,
      message: "Assessment started successfully",
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get questions for assessment
// @route   GET /api/assessments/questions
// @access  Private
export const getQuestions = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };
    if (category) {
      query.category = category;
    }

    const questions = await Question.find(query)
      .sort({ order: 1 })
      .select("-__v")
      .lean();

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save progress (auto-save)
// @route   PUT /api/assessments/:id/save
// @access  Private
export const saveProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { responses, currentStep, currentCategory, timeSpentMinutes } =
      req.body;
    const userId = req.user._id;

    // Find assessment
    const assessment = await Assessment.findOne({ _id: id, user: userId });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    if (assessment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Assessment already completed",
      });
    }

    // Update responses (merge with existing)
    if (responses && Array.isArray(responses)) {
      responses.forEach((newResponse) => {
        const existingIndex = assessment.responses.findIndex(
          (r) => r.questionId.toString() === newResponse.questionId
        );

        if (existingIndex >= 0) {
          // Update existing response
          assessment.responses[existingIndex] = {
            ...assessment.responses[existingIndex],
            ...newResponse,
            answeredAt: new Date(),
          };
        } else {
          // Add new response
          assessment.responses.push({
            ...newResponse,
            answeredAt: new Date(),
          });
        }
      });
    }

    // Update current progress
    if (currentStep) assessment.currentStep = currentStep;
    if (currentCategory) assessment.currentCategory = currentCategory;
    if (timeSpentMinutes) assessment.timeSpentMinutes = timeSpentMinutes;

    assessment.questionsAnswered = assessment.responses.length;
    assessment.completionPercentage = Math.round(
      (assessment.questionsAnswered / assessment.totalQuestions) * 100
    );
    assessment.lastSavedAt = new Date();

    // Update category progress
    const categoryCounts = assessment.responses.reduce((acc, r) => {
      const question = assessment.responses.find(
        (res) => res.questionId.toString() === r.questionId.toString()
      );
      if (question) {
        acc[currentCategory] = (acc[currentCategory] || 0) + 1;
      }
      return acc;
    }, {});

    Object.keys(assessment.categoryProgress).forEach((cat) => {
      if (categoryCounts[cat]) {
        assessment.categoryProgress[cat].answered = categoryCounts[cat];
        assessment.categoryProgress[cat].completed =
          categoryCounts[cat] >= assessment.categoryProgress[cat].total;
      }
    });

    await assessment.save();

    res.status(200).json({
      success: true,
      message: "Progress saved successfully",
      data: {
        _id: assessment._id,
        questionsAnswered: assessment.questionsAnswered,
        completionPercentage: assessment.completionPercentage,
        currentStep: assessment.currentStep,
        currentCategory: assessment.currentCategory,
        lastSavedAt: assessment.lastSavedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resume assessment
// @route   GET /api/assessments/resume
// @access  Private
export const resumeAssessment = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const assessment = await Assessment.findOne({
      user: userId,
      status: "in_progress",
    }).populate("user", "name email");

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "No assessment in progress found",
      });
    }

    res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit assessment
// @route   POST /api/assessments/:id/submit
// @access  Private
export const submitAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const assessment = await Assessment.findOne({ _id: id, user: userId });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    if (assessment.status === "completed") {
      return res.status(200).json({
        success: true,
        message: "Assessment already completed",
        data: {
          assessmentId: assessment._id,
          scores: assessment.scores,
          completedAt: assessment.completedAt,
          alreadyCompleted: true,
        },
      });
    }

    // Check if all questions are answered
    if (assessment.questionsAnswered < assessment.totalQuestions) {
      return res.status(400).json({
        success: false,
        message: `Please answer all questions. ${
          assessment.totalQuestions - assessment.questionsAnswered
        } questions remaining.`,
      });
    }

    // Calculate scores
    const scores = await calculateScores(assessment);

    assessment.scores = scores;
    assessment.status = "completed";
    assessment.completedAt = new Date();
    assessment.completionPercentage = 100;

    await assessment.save();

    res.status(200).json({
      success: true,
      message: "Assessment submitted successfully",
      data: {
        assessmentId: assessment._id,
        scores: assessment.scores,
        completedAt: assessment.completedAt,
      },
    });

    // Note: AI analysis will be handled in Module 3
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's assessment history
// @route   GET /api/assessments/my-assessments
// @access  Private
export const getMyAssessments = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const assessments = await Assessment.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("-responses -__v");

    res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single assessment details
// @route   GET /api/assessments/:id
// @access  Private
export const getAssessmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const assessment = await Assessment.findOne({
      _id: id,
      user: userId,
    }).populate("user", "name email currentGrade");

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
    next(error);
  }
};

// Helper function to calculate scores
const calculateScores = async (assessment) => {
  // Fetch all questions to get scoring information
  const questions = await Question.find().lean();
  const questionMap = questions.reduce((acc, q) => {
    acc[q._id.toString()] = q;
    return acc;
  }, {});

  // Initialize score accumulators
  const riasecScores = {
    realistic: 0,
    investigative: 0,
    artistic: 0,
    social: 0,
    enterprising: 0,
    conventional: 0,
  };

  const aptitudeScores = {
    numerical: 0,
    verbal: 0,
    spatial: 0,
    logical: 0,
    technical: 0,
    analytical: 0,
    creative: 0,
    attention: 0,
    critical: 0,
  };

  const personalityScores = {
    extraversion: 0,
    agreeableness: 0,
    conscientiousness: 0,
    emotional_stability: 0,
    openness: 0,
  };

  const academicScores = {
    mathematics: 0,
    science: 0,
    languages: 0,
    social_studies: 0,
    computer_science: 0,
    study_time: 0,
    learning_confidence: 0,
  };

  const categoryCounts = {
    riasec: {},
    aptitude: {},
    personality: {},
    academic: {},
  };

  // Calculate scores from responses
  assessment.responses.forEach((response) => {
    const question = questionMap[response.questionId.toString()];
    if (!question) return;

    const score = response.score || 0;
    const scoringKey = question.scoringKey;

    if (
      question.scoringType === "riasec" &&
      riasecScores.hasOwnProperty(scoringKey)
    ) {
      riasecScores[scoringKey] += score;
      categoryCounts.riasec[scoringKey] =
        (categoryCounts.riasec[scoringKey] || 0) + 1;
    } else if (
      question.scoringType === "aptitude" &&
      aptitudeScores.hasOwnProperty(scoringKey)
    ) {
      aptitudeScores[scoringKey] += score;
      categoryCounts.aptitude[scoringKey] =
        (categoryCounts.aptitude[scoringKey] || 0) + 1;
    } else if (
      question.scoringType === "big_five" &&
      personalityScores.hasOwnProperty(scoringKey)
    ) {
      personalityScores[scoringKey] += score;
      categoryCounts.personality[scoringKey] =
        (categoryCounts.personality[scoringKey] || 0) + 1;
    } else if (
      question.scoringType === "academic" &&
      academicScores.hasOwnProperty(scoringKey)
    ) {
      academicScores[scoringKey] += score;
      categoryCounts.academic[scoringKey] =
        (categoryCounts.academic[scoringKey] || 0) + 1;
    }
  });

  // Calculate averages
  Object.keys(riasecScores).forEach((key) => {
    const count = categoryCounts.riasec[key] || 1;
    riasecScores[key] = Math.round(riasecScores[key] / count);
  });

  Object.keys(aptitudeScores).forEach((key) => {
    const count = categoryCounts.aptitude[key] || 1;
    aptitudeScores[key] = Math.round(aptitudeScores[key] / count);
  });

  Object.keys(personalityScores).forEach((key) => {
    const count = categoryCounts.personality[key] || 1;
    personalityScores[key] = Math.round(personalityScores[key] / count);
  });

  Object.keys(academicScores).forEach((key) => {
    const count = categoryCounts.academic[key] || 1;
    academicScores[key] = Math.round(academicScores[key] / count);
  });

  return {
    interest: riasecScores,
    aptitude: aptitudeScores,
    personality: personalityScores,
    academic: academicScores,
  };
};
