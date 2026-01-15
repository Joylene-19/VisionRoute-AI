import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { generateAssessmentPDF } from "../services/pdfService.js";
import Assessment from "../models/Assessment.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * @route   GET /api/pdf/admin/assessment/:assessmentId
 * @desc    Generate and download assessment PDF for any user (Admin only)
 * @access  Private/Admin
 */
router.get(
  "/admin/assessment/:assessmentId",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { assessmentId } = req.params;

      // Get assessment (admin can access any assessment)
      const assessment = await Assessment.findById(assessmentId).populate(
        "user",
        "name email profilePhoto"
      );

      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      if (assessment.status !== "completed") {
        return res
          .status(400)
          .json({ message: "Assessment not completed yet" });
      }

      // Get top interest type
      const topInterest = Object.entries(assessment.scores.interest || {}).sort(
        (a, b) => b[1] - a[1]
      )[0];
      const topType = topInterest ? topInterest[0] : "investigative";

      // Get recommended stream
      const topAcademic = Object.entries(assessment.scores.academic || {}).sort(
        (a, b) => b[1] - a[1]
      )[0];
      const recommendedStream = topAcademic
        ? topAcademic[0].charAt(0).toUpperCase() + topAcademic[0].slice(1)
        : "Science";

      // Create analysis structure
      const analysis = {
        summary:
          `Career assessment completed successfully! Based on responses, showing strong ${topType} traits. ` +
          `${recommendedStream} stream is recommended based on aptitude and interests.`,
        recommendedStream,
        careerMatches: generateDefaultCareerMatches(topType),
      };

      // Convert scores.interest to riasec format for PDF
      assessment.scores.riasec = {
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

      // Rename aptitude to aptitudes for PDF
      assessment.scores.aptitudes = assessment.scores.aptitude;

      // Generate PDF (use the student's user object, not the admin's)
      const pdfBuffer = await generateAssessmentPDF(
        assessment,
        assessment.user,
        analysis
      );

      // Set headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="VisionRoute_Report_${
          assessment.user.name || "Student"
        }.pdf"`
      );

      // Send PDF
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Admin PDF generation error:", error);
      res
        .status(500)
        .json({ message: "Failed to generate PDF", error: error.message });
    }
  }
);

/**
 * @route   GET /api/pdf/assessment/:assessmentId
 * @desc    Generate and download assessment PDF
 * @access  Private
 */
router.get("/assessment/:assessmentId", protect, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user._id;

    // Get assessment
    const assessment = await Assessment.findOne({
      _id: assessmentId,
      user: userId,
    });

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    if (assessment.status !== "completed") {
      return res.status(400).json({ message: "Assessment not completed yet" });
    }

    // Get top interest type
    const topInterest = Object.entries(assessment.scores.interest || {}).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const topType = topInterest ? topInterest[0] : "investigative";

    // Get recommended stream
    const topAcademic = Object.entries(assessment.scores.academic || {}).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const recommendedStream = topAcademic
      ? topAcademic[0].charAt(0).toUpperCase() + topAcademic[0].slice(1)
      : "Science";

    // Create analysis structure
    const analysis = {
      summary:
        `Your career assessment has been completed successfully! Based on your responses, you show strong ${topType} traits. ` +
        `Your ${recommendedStream} stream is recommended based on your aptitude and interests.`,
      recommendedStream,
      careerMatches: generateDefaultCareerMatches(topType),
    };

    // Convert scores.interest to riasec format for PDF
    assessment.scores.riasec = {
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

    // Rename aptitude to aptitudes for PDF
    assessment.scores.aptitudes = assessment.scores.aptitude;

    // Generate PDF
    const pdfBuffer = await generateAssessmentPDF(
      assessment,
      req.user,
      analysis
    );

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="VisionRoute_Report_${
        req.user.fullName || "Student"
      }.pdf"`
    );

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    res
      .status(500)
      .json({ message: "Failed to generate PDF", error: error.message });
  }
});

// Helper function to generate default career matches
function generateDefaultCareerMatches(interestType) {
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

export default router;
