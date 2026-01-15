import Assessment from "../models/Assessment.js";
import Question from "../models/Question.js";
import { sendAssessmentCompleteEmail } from "../services/emailService.js";
import { generateAssessmentPDF } from "../services/pdfService.js";

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

    // Generate PDF and send assessment completion email (async, don't wait)
    (async () => {
      try {
        console.log("📧 Starting PDF generation and email sending...");

        // Get top interest type
        const topInterest = Object.entries(
          assessment.scores.interest || {}
        ).sort((a, b) => b[1] - a[1])[0];
        const topType = topInterest ? topInterest[0] : "investigative";

        // Get recommended stream
        const topAcademic = Object.entries(
          assessment.scores.academic || {}
        ).sort((a, b) => b[1] - a[1])[0];
        const recommendedStream = topAcademic
          ? topAcademic[0].charAt(0).toUpperCase() + topAcademic[0].slice(1)
          : "Science";

        // Generate career matches based on interest type
        const careerMatches = generateCareerMatchesForEmail(topType);

        console.log(
          `📊 Top type: ${topType}, Stream: ${recommendedStream}, Careers: ${careerMatches.length}`
        );

        // Create analysis structure for PDF
        const analysis = {
          summary:
            `Your career assessment has been completed successfully! Based on your responses, you show strong ${topType} traits. ` +
            `Your ${recommendedStream} stream is recommended based on your aptitude and interests.`,
          recommendedStream,
          careerMatches,
        };

        // Convert scores.interest to riasec format for PDF
        const riasecScores = {
          realistic: assessment.scores.interest.realistic || 0,
          investigative: assessment.scores.interest.investigative || 0,
          artistic: assessment.scores.interest.artistic || 0,
          social: assessment.scores.interest.social || 0,
          enterprising: assessment.scores.interest.enterprising || 0,
          conventional: assessment.scores.interest.conventional || 0,
          topThreeTypes: Object.entries(assessment.scores.interest || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([type]) => type.charAt(0).toUpperCase() + type.slice(1)),
        };

        // Temporarily add to assessment for PDF generation
        assessment.scores.riasec = riasecScores;
        assessment.scores.aptitudes = assessment.scores.aptitude;

        console.log("📄 Generating PDF...");

        // Generate PDF
        const pdfBuffer = await generateAssessmentPDF(
          assessment,
          req.user,
          analysis
        );

        console.log(`✅ PDF generated: ${pdfBuffer.length} bytes`);
        console.log(`📧 Sending email to ${req.user.email}...`);

        // Send email with PDF attachment
        await sendAssessmentCompleteEmail(req.user, pdfBuffer);

        console.log("✅ Email sent successfully!");
      } catch (error) {
        console.error("❌ Failed to generate PDF or send email:", error);
        // Don't fail submission if email/PDF fails
      }
    })();

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

// Helper function to generate career matches based on interest type
function generateCareerMatchesForEmail(interestType) {
  const careerMap = {
    realistic: [
      {
        title: "Engineering",
        description: "Design and build systems, machines, and structures",
        matchPercentage: 92,
      },
      {
        title: "Architecture",
        description: "Create functional and aesthetic building designs",
        matchPercentage: 88,
      },
      {
        title: "Mechanical Technician",
        description: "Repair and maintain mechanical systems",
        matchPercentage: 85,
      },
      {
        title: "Civil Engineering",
        description: "Plan and oversee construction projects",
        matchPercentage: 83,
      },
      {
        title: "Automotive Technology",
        description: "Work with vehicle systems and mechanics",
        matchPercentage: 80,
      },
    ],
    investigative: [
      {
        title: "Research Scientist",
        description: "Conduct research and analyze scientific data",
        matchPercentage: 95,
      },
      {
        title: "Data Analyst",
        description: "Interpret complex data and provide insights",
        matchPercentage: 90,
      },
      {
        title: "Medical Professional",
        description: "Diagnose and treat health conditions",
        matchPercentage: 87,
      },
      {
        title: "Software Developer",
        description: "Create and maintain software applications",
        matchPercentage: 85,
      },
      {
        title: "Researcher",
        description: "Investigate and analyze complex problems",
        matchPercentage: 82,
      },
    ],
    artistic: [
      {
        title: "Graphic Designer",
        description: "Create visual concepts and designs",
        matchPercentage: 93,
      },
      {
        title: "Content Creator",
        description: "Produce engaging digital content",
        matchPercentage: 89,
      },
      {
        title: "Art Director",
        description: "Lead creative projects and teams",
        matchPercentage: 86,
      },
      {
        title: "UI/UX Designer",
        description: "Design user interfaces and experiences",
        matchPercentage: 84,
      },
      {
        title: "Creative Writer",
        description: "Write compelling content and stories",
        matchPercentage: 81,
      },
    ],
    social: [
      {
        title: "Teacher/Educator",
        description: "Educate and inspire students",
        matchPercentage: 94,
      },
      {
        title: "Counselor",
        description: "Guide and support individuals",
        matchPercentage: 91,
      },
      {
        title: "Healthcare Professional",
        description: "Provide patient care and support",
        matchPercentage: 88,
      },
      {
        title: "Social Worker",
        description: "Help communities and individuals in need",
        matchPercentage: 85,
      },
      {
        title: "Human Resources",
        description: "Manage employee relations and development",
        matchPercentage: 82,
      },
    ],
    enterprising: [
      {
        title: "Business Manager",
        description: "Lead teams and manage operations",
        matchPercentage: 92,
      },
      {
        title: "Entrepreneur",
        description: "Start and grow your own business",
        matchPercentage: 90,
      },
      {
        title: "Sales Executive",
        description: "Build relationships and drive sales",
        matchPercentage: 85,
      },
      {
        title: "Marketing Manager",
        description: "Develop and execute marketing strategies",
        matchPercentage: 83,
      },
      {
        title: "Business Consultant",
        description: "Advise organizations on strategy and growth",
        matchPercentage: 80,
      },
    ],
    conventional: [
      {
        title: "Accountant",
        description: "Manage financial records and reporting",
        matchPercentage: 93,
      },
      {
        title: "Data Administrator",
        description: "Organize and maintain databases",
        matchPercentage: 89,
      },
      {
        title: "Project Coordinator",
        description: "Plan and execute projects efficiently",
        matchPercentage: 86,
      },
      {
        title: "Financial Analyst",
        description: "Analyze financial data and trends",
        matchPercentage: 84,
      },
      {
        title: "Administrative Manager",
        description: "Oversee office operations and procedures",
        matchPercentage: 81,
      },
    ],
  };

  return (
    careerMap[interestType] || [
      {
        title: "Technology Professional",
        description: "Work with cutting-edge technology",
        matchPercentage: 90,
      },
      {
        title: "Business Analyst",
        description: "Analyze business processes and recommend improvements",
        matchPercentage: 85,
      },
      {
        title: "Consultant",
        description: "Provide expert advice to organizations",
        matchPercentage: 82,
      },
      {
        title: "Project Manager",
        description: "Lead and deliver successful projects",
        matchPercentage: 80,
      },
      {
        title: "Operations Specialist",
        description: "Optimize business operations and workflows",
        matchPercentage: 77,
      },
    ]
  );
}

/**
 * @desc    Get user's assessment history
 * @route   GET /api/assessments/history
 * @access  Private
 */
export const getAssessmentHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const assessments = await Assessment.find({ user: userId })
      .sort({ createdAt: -1 })
      .select(
        "status totalQuestions questionsAnswered completedAt createdAt timeSpentMinutes scores careerRecommendations"
      )
      .lean();

    res.status(200).json({
      success: true,
      data: assessments,
    });
  } catch (error) {
    console.error("Get assessment history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assessment history",
      error: error.message,
    });
  }
};
