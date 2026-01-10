import Assessment from "../models/Assessment.js";
import User from "../models/User.js";
import { generateCareerAnalysis } from "../services/aiAnalysisService.js";

/**
 * @desc    Generate AI career analysis for a completed assessment
 * @route   POST /api/analysis/:assessmentId/generate
 * @access  Private
 */
export const generateAnalysis = async (req, res, next) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user._id;

    // Find the assessment
    const assessment = await Assessment.findOne({
      _id: assessmentId,
      user: userId,
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    // Check if assessment is completed
    if (assessment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Assessment must be completed before generating analysis",
      });
    }

    // Check if analysis already exists
    if (assessment.aiAnalysis && !req.body.regenerate) {
      return res.status(200).json({
        success: true,
        message: "Analysis already exists",
        data: assessment.aiAnalysis,
        cached: true,
      });
    }

    // Get user data for personalization
    const user = await User.findById(userId).select("name email class age");

    // Generate AI analysis
    console.log("🤖 Generating AI career analysis...");
    const analysisResult = await generateCareerAnalysis(
      {
        scores: assessment.scores,
        responses: assessment.responses,
      },
      {
        name: user.name,
        class: user.class || "Not specified",
        age: user.age || "Not specified",
      }
    );

    // Save analysis to assessment
    assessment.aiAnalysis = analysisResult.data;
    assessment.aiAnalysisGeneratedAt = new Date();
    await assessment.save();

    res.status(200).json({
      success: true,
      message: "Career analysis generated successfully",
      data: analysisResult.data,
      cached: false,
    });
  } catch (error) {
    console.error("Analysis generation error:", error);
    next(error);
  }
};

/**
 * @desc    Get existing AI analysis for an assessment
 * @route   GET /api/analysis/:assessmentId
 * @access  Private
 */
export const getAnalysis = async (req, res, next) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user._id;

    const assessment = await Assessment.findOne({
      _id: assessmentId,
      user: userId,
    }).select("aiAnalysis aiAnalysisGeneratedAt scores status");

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    if (!assessment.aiAnalysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not generated yet. Please generate analysis first.",
        needsGeneration: true,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        analysis: assessment.aiAnalysis,
        scores: assessment.scores,
        generatedAt: assessment.aiAnalysisGeneratedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get analysis summary for all completed assessments
 * @route   GET /api/analysis/my-analyses
 * @access  Private
 */
export const getMyAnalyses = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const assessments = await Assessment.find({
      user: userId,
      status: "completed",
    })
      .select(
        "completedAt scores aiAnalysis.summary aiAnalysis.recommendedStream aiAnalysisGeneratedAt"
      )
      .sort({ completedAt: -1 });

    const analyses = assessments.map((assessment) => ({
      assessmentId: assessment._id,
      completedAt: assessment.completedAt,
      summary: assessment.aiAnalysis?.summary || "Not generated",
      recommendedStream:
        assessment.aiAnalysis?.recommendedStream?.primary || "Not generated",
      hasAnalysis: !!assessment.aiAnalysis,
      analysisGeneratedAt: assessment.aiAnalysisGeneratedAt,
    }));

    res.status(200).json({
      success: true,
      count: analyses.length,
      data: analyses,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  generateAnalysis,
  getAnalysis,
  getMyAnalyses,
};
