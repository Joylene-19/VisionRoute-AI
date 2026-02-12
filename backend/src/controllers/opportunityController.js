import OpportunityAnalysis from "../models/OpportunityAnalysis.js";
import Assessment from "../models/Assessment.js";
import { groqClient } from "../config/openai.js";

/**
 * Build AI prompt for opportunity analysis
 */
function buildOpportunityPrompt(userData, formData, assessmentData) {
  const academicDetails = JSON.stringify(formData.academicData, null, 2);

  let assessmentSection = "No assessment completed yet";
  if (assessmentData?.isCompleted) {
    const riasec =
      assessmentData.results?.riasec?.topThreeTypes?.join(", ") || "N/A";
    const topCareer =
      assessmentData.results?.careerMatches?.[0]?.title || "N/A";
    assessmentSection = `
RIASEC Personality Types: ${riasec}
Top Career Match: ${topCareer}
Strengths: ${assessmentData.results?.strengths?.slice(0, 3).join(", ") || "N/A"}`;
  }

  // Determine student's current academic status
  let statusDescription = "";
  if (["10th Pass", "12th Pass"].includes(formData.educationLevel)) {
    statusDescription = `Has completed ${formData.educationLevel}`;
  } else if (formData.educationStatus === "Currently Studying") {
    const semesters = formData.academicData?.semestersCompleted || "N/A";
    statusDescription = `Currently studying ${formData.educationLevel} - ${semesters} semester(s) completed`;
  } else if (formData.educationStatus === "Completed") {
    const year = formData.academicData?.passingYear || "Recently";
    statusDescription = `Completed ${formData.educationLevel} in ${year}`;
  } else {
    statusDescription = formData.educationLevel;
  }

  // Extract key academic metrics
  let academicPerformance = "";
  if (formData.academicData?.percentage) {
    academicPerformance = `Percentage: ${formData.academicData.percentage}%`;
  } else if (formData.academicData?.currentCGPA) {
    academicPerformance = `Current CGPA: ${formData.academicData.currentCGPA}/10`;
  } else if (formData.academicData?.finalCGPA) {
    academicPerformance = `Final CGPA: ${formData.academicData.finalCGPA}/10`;
  }

  return `You are an Indian education and career opportunity advisor specializing in scholarships, higher education, and career planning.

**STUDENT PROFILE:**
Name: ${userData.fullName}
Current Grade: ${userData.currentGrade || "Not specified"}
Stream: ${userData.stream || "Not specified"}

**CURRENT ACADEMIC STATUS:**
${statusDescription}
${academicPerformance}

**OPPORTUNITY ANALYSIS REQUEST:**
Education Level: ${formData.educationLevel}
${formData.educationStatus ? `Education Status: ${formData.educationStatus}` : ""}
Family Annual Income: ${formData.familyIncome}
Career Interest: ${formData.careerInterest}

**DETAILED ACADEMIC DATA:**
${academicDetails}

**ASSESSMENT INSIGHTS:**
${assessmentSection}

**TASK:**
Generate personalized opportunity recommendations in this EXACT JSON format:

{
  "scholarships": [
    {
      "type": "Merit Based | Need Based | STEM | Research | Minority",
      "name": "Specific Indian scholarship name (real scholarships only)",
      "eligibility": "Clear criteria",
      "estimatedAmount": "₹XX,XXX - ₹XX,XXX or Full Tuition",
      "matchPercentage": 85,
      "applicationLink": "Official website or 'Contact institution'"
    }
  ],
  "higherEducation": [
    {
      "program": "Degree/Course name (MSc, MBA, MTech, etc.)",
      "duration": "X years",
      "topColleges": ["IIT Bombay", "NIT Trichy", "BITS Pilani"],
      "careerOutcomes": ["Software Engineer", "Data Scientist"],
      "matchPercentage": 90,
      "eligibility": "Requirements (12th %, entrance exams)"
    }
  ],
  "careerPaths": [
    {
      "title": "Career title",
      "description": "2-3 sentence description",
      "requiredSkills": ["Skill 1", "Skill 2", "Skill 3"],
      "salaryRange": "₹X - ₹Y LPA (realistic Indian market)",
      "growthPotential": "High | Medium | Moderate",
      "matchPercentage": 88,
      "industryDemand": "Growing | Stable | Emerging"
    }
  ],
  "skillDevelopment": [
    {
      "category": "Programming | Management | Research | Communication | etc",
      "skills": ["Python", "Data Analysis", "Leadership"],
      "resources": ["Free Coursera courses", "YouTube channels", "Books"],
      "priority": "High | Medium | Low",
      "estimatedTime": "X months to achieve proficiency"
    }
  ],
  "confidenceScore": 85
}

**CRITICAL GUIDELINES:**
1. **Scholarships:** Focus on REAL Indian scholarships (INSPIRE, NSP, Merit-cum-Means, State scholarships, Private scholarships by companies). Consider family income range for need-based recommendations. For students currently studying, suggest scholarships for their ongoing education. For completed education, suggest scholarships for next level.

2. **Higher Education:** Suggest realistic programs based on student's current level:
   - 10th Pass → 11th/12th stream selection + Bachelor programs to target
   - 12th Pass → Bachelor programs + entrance exams (JEE, NEET, CLAT, etc.)
   - Diploma (studying) → Lateral entry to BTech, or complete Diploma first
   - Diploma (completed) → BTech lateral entry, or direct Master's programs
   - Bachelor (studying with 4+ semesters) → Start preparing for Master's entrance (CAT, GATE, etc.)
   - Bachelor (completed) → Master programs (MSc, MTech, MBA, etc.)
   - Master (studying) → PhD programs, research opportunities
   - Master (completed) → PhD, Post-Doc, Industry research roles

3. **Career Paths:** Provide 4-5 careers aligned with academic background, current progress, and interests. Use realistic Indian salary ranges:
   - 10th/12th Pass: Entry-level jobs (2-5 LPA)
   - Diploma: Technician/Junior roles (3-6 LPA)
   - Bachelor (studying): Internships + Future careers (4-10 LPA post-graduation)
   - Bachelor (completed): Fresher roles (3-8 LPA)
   - Master: Mid-level roles (8-20 LPA)

4. **Skills:** Focus on practical, learnable skills based on where student is now:
   - Currently studying → Skills to excel in current education + prepare for next level
   - Completed → Skills to get jobs OR prepare for higher education
   Provide FREE or affordable resources accessible in India (NPTEL, Coursera free courses, YouTube, etc.).

5. **Match Percentages:** Base on:
   - Academic performance (CGPA/Percentage)
   - Career interest alignment
   - Assessment results (if available)
   - Current progress (semesters completed matters!)
   Higher academic scores + more semesters completed = higher match percentages

6. **Confidence Score:** Calculate based on available data completeness:
   - Assessment completed + high academic detail + multiple semesters completed = 90-100
   - Assessment completed OR detailed academics = 70-89
   - Basic info only = 50-69

**IMPORTANT:** Consider if student is currently studying vs completed. For studying students, focus on:
- Opportunities available NOW (scholarships for current year, internships)
- Preparation for what comes NEXT (entrance exams, skill building)
For completed students, focus on:
- Next immediate step (higher education programs, job opportunities)
- Application deadlines and preparation timelines

Return ONLY valid JSON. No markdown. No explanations outside JSON.`;
}

/**
 * Submit new opportunity analysis
 * POST /api/opportunity
 */
export const submitAnalysis = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      educationLevel,
      educationStatus,
      familyIncome,
      careerInterest,
      academicData,
    } = req.body;

    // Validation
    if (!educationLevel || !familyIncome || !careerInterest || !academicData) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // educationStatus is only required for Diploma, Bachelor, and Master degrees
    const requiresStatus = !["10th Pass", "12th Pass"].includes(educationLevel);
    if (requiresStatus && !educationStatus) {
      return res.status(400).json({
        success: false,
        message: "Education status is required",
      });
    }

    // Fetch latest assessment for context (optional)
    const latestAssessment = await Assessment.findOne({ userId }).sort({
      createdAt: -1,
    });

    // Build comprehensive AI prompt
    const prompt = buildOpportunityPrompt(
      req.user,
      {
        educationLevel,
        educationStatus,
        familyIncome,
        careerInterest,
        academicData,
      },
      latestAssessment,
    );

    // Call Groq AI
    if (!groqClient) {
      throw new Error("AI service not available");
    }

    const completion = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert Indian education and scholarship advisor. Always return valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const aiResponse = completion.choices[0].message.content;

    // Parse AI response
    let recommendations;
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = aiResponse.trim();
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "");
      } else if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse.replace(/```\n?/g, "");
      }

      recommendations = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("AI JSON Parse Error:", parseError);
      console.error("AI Response:", aiResponse);
      return res.status(500).json({
        success: false,
        message: "Failed to parse AI response. Please try again.",
      });
    }

    // Extract confidence score
    const confidenceScore = recommendations.confidenceScore || 75;

    // Create analysis document
    const analysisData = {
      userId,
      educationLevel,
      familyIncome,
      careerInterest,
      academicData,
      recommendations: {
        scholarships: recommendations.scholarships || [],
        higherEducation: recommendations.higherEducation || [],
        careerPaths: recommendations.careerPaths || [],
        skillDevelopment: recommendations.skillDevelopment || [],
      },
      confidenceScore,
      isActive: true,
    };

    // Only add educationStatus if it exists (not for 10th/12th Pass)
    if (educationStatus) {
      analysisData.educationStatus = educationStatus;
    }

    const analysis = await OpportunityAnalysis.create(analysisData);

    res.json({
      success: true,
      message: "Analysis completed successfully",
      data: analysis,
    });
  } catch (error) {
    console.error("Submit Analysis Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate analysis",
      error: error.message,
    });
  }
};

/**
 * Get analysis history for user
 * GET /api/opportunity/history
 */
export const getAnalysisHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const analyses = await OpportunityAnalysis.find({
      userId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .select(
        "educationLevel confidenceScore createdAt recommendations.scholarships recommendations.careerPaths",
      )
      .limit(20);

    res.json({
      success: true,
      data: analyses,
    });
  } catch (error) {
    console.error("Get History Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch history",
      error: error.message,
    });
  }
};

/**
 * Get specific analysis by ID
 * GET /api/opportunity/:id
 */
export const getAnalysisById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const analysis = await OpportunityAnalysis.findOne({
      _id: id,
      userId,
      isActive: true,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Get Analysis Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analysis",
      error: error.message,
    });
  }
};

/**
 * Regenerate analysis with fresh AI recommendations
 * POST /api/opportunity/:id/regenerate
 */
export const regenerateAnalysis = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // Find existing analysis
    const existingAnalysis = await OpportunityAnalysis.findOne({
      _id: id,
      userId,
      isActive: true,
    });

    if (!existingAnalysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    // Fetch latest assessment (fresh context)
    const latestAssessment = await Assessment.findOne({ userId }).sort({
      createdAt: -1,
    });

    // Build fresh AI prompt
    const prompt = buildOpportunityPrompt(
      req.user,
      {
        educationLevel: existingAnalysis.educationLevel,
        educationStatus: existingAnalysis.educationStatus,
        familyIncome: existingAnalysis.familyIncome,
        careerInterest: existingAnalysis.careerInterest,
        academicData: existingAnalysis.academicData,
      },
      latestAssessment,
    );

    // Call AI
    const completion = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert Indian education and scholarship advisor. Always return valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const aiResponse = completion.choices[0].message.content;

    // Parse response
    let recommendations;
    try {
      let cleanedResponse = aiResponse.trim();
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "");
      } else if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse.replace(/```\n?/g, "");
      }
      recommendations = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("AI JSON Parse Error:", parseError);
      return res.status(500).json({
        success: false,
        message: "Failed to parse AI response. Please try again.",
      });
    }

    // Update existing document
    existingAnalysis.recommendations = {
      scholarships: recommendations.scholarships || [],
      higherEducation: recommendations.higherEducation || [],
      careerPaths: recommendations.careerPaths || [],
      skillDevelopment: recommendations.skillDevelopment || [],
    };
    existingAnalysis.confidenceScore = recommendations.confidenceScore || 75;
    existingAnalysis.regenerationCount += 1;

    await existingAnalysis.save();

    res.json({
      success: true,
      message: "Analysis regenerated successfully",
      data: existingAnalysis,
    });
  } catch (error) {
    console.error("Regenerate Analysis Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to regenerate analysis",
      error: error.message,
    });
  }
};

/**
 * Delete analysis (soft delete)
 * DELETE /api/opportunity/:id
 */
export const deleteAnalysis = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const analysis = await OpportunityAnalysis.findOne({
      _id: id,
      userId,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    // Soft delete
    analysis.isActive = false;
    await analysis.save();

    res.json({
      success: true,
      message: "Analysis deleted successfully",
    });
  } catch (error) {
    console.error("Delete Analysis Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete analysis",
      error: error.message,
    });
  }
};
