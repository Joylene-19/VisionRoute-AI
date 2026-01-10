import { generateAIContent } from "../config/gemini.js";

/**
 * AI Analysis Service - Uses Google Gemini to analyze assessment results
 * and generate personalized career guidance for Indian students
 */

/**
 * Generate comprehensive career analysis based on assessment scores
 * @param {Object} assessmentData - Complete assessment with scores
 * @param {Object} userData - User information (class, age, etc.)
 * @returns {Promise<Object>} - AI-generated career analysis
 */
export const generateCareerAnalysis = async (assessmentData, userData) => {
  try {
    const { scores } = assessmentData;

    // Try to use AI first
    try {
      // Build comprehensive prompt for Gemini
      const prompt = buildCareerAnalysisPrompt(scores, userData);

      // Get AI response
      const aiResponse = await generateAIContent(prompt);

      // Parse and structure the response
      const analysis = parseAIResponse(aiResponse);

      return {
        success: true,
        data: analysis,
      };
    } catch (aiError) {
      console.warn(
        "⚠️  AI generation failed, using fallback analysis:",
        aiError.message
      );
      // Use fallback analysis based on scores
      const fallbackAnalysis = generateFallbackAnalysis(scores, userData);

      return {
        success: true,
        data: fallbackAnalysis,
      };
    }
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("Failed to generate career analysis");
  }
};

/**
 * Build detailed prompt for career analysis
 */
const buildCareerAnalysisPrompt = (scores, userData) => {
  const { riasec, aptitude, personality, academic } = scores;

  return `You are an expert career counselor specializing in the Indian education system. Analyze the following student assessment results and provide detailed, personalized career guidance.

**STUDENT PROFILE:**
- Name: ${userData.name || "Student"}
- Class/Grade: ${userData.class || "10th/12th"}
- Age: ${userData.age || "15-18"}

**ASSESSMENT SCORES:**

1. **RIASEC Career Interests:**
   - Realistic (R): ${riasec?.realistic || 0}/100 - Hands-on, practical work
   - Investigative (I): ${riasec?.investigative || 0}/100 - Research, analysis
   - Artistic (A): ${riasec?.artistic || 0}/100 - Creative expression
   - Social (S): ${riasec?.social || 0}/100 - Helping people
   - Enterprising (E): ${riasec?.enterprising || 0}/100 - Leadership, business
   - Conventional (C): ${riasec?.conventional || 0}/100 - Organization, detail

2. **Aptitude Scores:**
   - Numerical: ${aptitude?.numerical || 0}/100
   - Verbal: ${aptitude?.verbal || 0}/100
   - Logical: ${aptitude?.logical || 0}/100
   - Spatial: ${aptitude?.spatial || 0}/100
   - Mechanical: ${aptitude?.mechanical || 0}/100

3. **Big Five Personality Traits:**
   - Openness: ${personality?.openness || 0}/100
   - Conscientiousness: ${personality?.conscientiousness || 0}/100
   - Extraversion: ${personality?.extraversion || 0}/100
   - Agreeableness: ${personality?.agreeableness || 0}/100
   - Emotional Stability: ${personality?.emotionalStability || 0}/100

4. **Academic Performance:**
   - Math Performance: ${academic?.mathPerformance || 0}/100
   - Science Performance: ${academic?.sciencePerformance || 0}/100
   - Language Performance: ${academic?.languagePerformance || 0}/100
   - Overall Academic Motivation: ${academic?.motivation || 0}/100

**TASK:**
Based on these scores, provide a comprehensive career analysis in **JSON format only** with the following structure:

{
  "summary": "A 2-3 sentence overview of the student's strengths and potential",
  "riasecProfile": {
    "dominantType": "The highest RIASEC type (R/I/A/S/E/C)",
    "description": "What this means for their career interests"
  },
  "recommendedStream": {
    "primary": "Science (PCM/PCB) OR Commerce OR Arts/Humanities",
    "reasoning": "Why this stream suits them best (2-3 sentences)",
    "alternatives": ["Alternative stream 1", "Alternative stream 2"]
  },
  "subjectRecommendations": {
    "core": ["Subject 1", "Subject 2", "Subject 3"],
    "electives": ["Elective 1", "Elective 2"]
  },
  "careerPaths": [
    {
      "title": "Career Option 1",
      "matchScore": 95,
      "description": "Brief description",
      "requiredEducation": "Degree/qualification needed",
      "entranceExams": ["JEE", "NEET", etc.],
      "topColleges": ["IIT Delhi", "AIIMS", etc.]
    },
    {
      "title": "Career Option 2",
      "matchScore": 90,
      "description": "Brief description",
      "requiredEducation": "Degree/qualification needed",
      "entranceExams": ["Exam 1", "Exam 2"],
      "topColleges": ["College 1", "College 2"]
    },
    {
      "title": "Career Option 3",
      "matchScore": 85,
      "description": "Brief description",
      "requiredEducation": "Degree/qualification needed",
      "entranceExams": ["Exam 1"],
      "topColleges": ["College 1"]
    }
  ],
  "strengths": [
    "Key strength 1 based on scores",
    "Key strength 2 based on scores",
    "Key strength 3 based on scores"
  ],
  "developmentAreas": [
    "Area to improve 1",
    "Area to improve 2"
  ],
  "actionPlan": {
    "immediate": ["Action step 1", "Action step 2"],
    "shortTerm": ["6-month goal 1", "6-month goal 2"],
    "longTerm": ["1-year+ goal 1", "1-year+ goal 2"]
  },
  "resources": {
    "books": ["Recommended book 1", "Recommended book 2"],
    "websites": ["Useful website 1", "Useful website 2"],
    "courses": ["Online course 1", "Online course 2"]
  }
}

**IMPORTANT:**
- Focus on Indian education system (CBSE/ICSE/State boards)
- Mention relevant entrance exams (JEE, NEET, CLAT, CA, etc.)
- Suggest realistic career paths available in India
- Consider both traditional and emerging career options
- Be encouraging but honest about strengths and areas for improvement
- Return ONLY valid JSON, no additional text before or after

Provide the complete JSON response now:`;
};

/**
 * Parse AI response and extract structured data
 */
const parseAIResponse = (aiResponse) => {
  try {
    // Remove markdown code blocks if present
    let jsonString = aiResponse.trim();
    jsonString = jsonString.replace(/```json\n?/g, "");
    jsonString = jsonString.replace(/```\n?/g, "");
    jsonString = jsonString.trim();

    // Parse JSON
    const parsed = JSON.parse(jsonString);

    // Validate required fields
    if (!parsed.summary || !parsed.recommendedStream || !parsed.careerPaths) {
      throw new Error("Invalid AI response structure");
    }

    // Add metadata
    parsed.generatedAt = new Date();
    parsed.modelUsed = "gemini-2.0-flash-exp";

    return parsed;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    console.error("Raw response:", aiResponse);

    // Return fallback structure
    return {
      summary:
        "Analysis completed. Please review the detailed recommendations below.",
      error: "Failed to parse AI response",
      rawResponse: aiResponse,
      generatedAt: new Date(),
      modelUsed: "gemini-2.0-flash-exp",
    };
  }
};

/**
 * Generate subject-wise recommendations
 * @param {Object} scores - Assessment scores
 * @returns {Promise<Object>} - Subject recommendations
 */
export const generateSubjectRecommendations = async (scores) => {
  const prompt = `Based on these aptitude scores, recommend the best subjects for class 11-12:
  
Aptitude Scores:
- Numerical: ${scores.aptitude?.numerical || 0}/100
- Verbal: ${scores.aptitude?.verbal || 0}/100
- Logical: ${scores.aptitude?.logical || 0}/100
- Spatial: ${scores.aptitude?.spatial || 0}/100

Academic Scores:
- Math: ${scores.academic?.mathPerformance || 0}/100
- Science: ${scores.academic?.sciencePerformance || 0}/100
- Language: ${scores.academic?.languagePerformance || 0}/100

Return JSON with:
{
  "scienceStream": { "recommended": true/false, "subjects": ["Physics", "Chemistry", "Math/Biology"] },
  "commerceStream": { "recommended": true/false, "subjects": ["Accountancy", "Economics", etc.] },
  "artsStream": { "recommended": true/false, "subjects": ["History", "Psychology", etc.] }
}`;

  const response = await generateAIContent(prompt);
  return parseAIResponse(response);
};

/**
 * Generate fallback analysis when AI is unavailable
 * @param {Object} scores - Assessment scores
 * @param {Object} userData - User data
 * @returns {Object} - Structured career analysis
 */
const generateFallbackAnalysis = (scores, userData) => {
  const { riasec, aptitude, personality, academic } = scores;

  // Determine top RIASEC traits
  const riasecScores = [
    { name: "Realistic", score: riasec?.realistic || 0 },
    { name: "Investigative", score: riasec?.investigative || 0 },
    { name: "Artistic", score: riasec?.artistic || 0 },
    { name: "Social", score: riasec?.social || 0 },
    { name: "Enterprising", score: riasec?.enterprising || 0 },
    { name: "Conventional", score: riasec?.conventional || 0 },
  ].sort((a, b) => b.score - a.score);

  const topTrait = riasecScores[0].name;
  const secondTrait = riasecScores[1].name;

  // Determine recommended stream
  let recommendedStream = "Science";
  if (
    (aptitude?.numerical || 0) > 70 &&
    (academic?.mathPerformance || 0) > 65
  ) {
    recommendedStream = "Science (PCM)";
  } else if (
    (aptitude?.numerical || 0) > 60 &&
    (riasec?.conventional || 0) > 60
  ) {
    recommendedStream = "Commerce";
  } else if ((riasec?.artistic || 0) > 70 || (riasec?.social || 0) > 70) {
    recommendedStream = "Arts/Humanities";
  }

  return {
    summary: `Based on your assessment results, you show strong ${topTrait} and ${secondTrait} traits. Your ${recommendedStream} stream is recommended based on your aptitude and interests.`,
    recommendedStream: recommendedStream,
    riasecProfile: {
      topTraits: [topTrait, secondTrait, riasecScores[2].name],
      scores: {
        realistic: riasec?.realistic || 0,
        investigative: riasec?.investigative || 0,
        artistic: riasec?.artistic || 0,
        social: riasec?.social || 0,
        enterprising: riasec?.enterprising || 0,
        conventional: riasec?.conventional || 0,
      },
      description: `You have a ${topTrait} personality, which means you excel in hands-on, practical tasks and prefer working with tangible results.`,
    },
    recommendedSubjects: getSubjectsByStream(recommendedStream),
    careerPaths: getCareerPathsByTrait(topTrait, secondTrait),
    strengths: [
      `Strong ${topTrait.toLowerCase()} abilities`,
      `Good ${secondTrait.toLowerCase()} skills`,
      `Aptitude for problem-solving`,
    ],
    areasForDevelopment: [
      "Continue building on your core strengths",
      "Explore diverse learning opportunities",
      "Develop communication and teamwork skills",
    ],
    actionPlan: {
      immediate: [
        "Research career options in your recommended stream",
        "Talk to professionals in fields of interest",
        "Start building relevant skills",
      ],
      shortTerm: [
        "Choose subjects aligned with your career goals",
        "Join relevant clubs or activities",
        "Seek mentorship from field experts",
      ],
      longTerm: [
        "Plan your higher education path",
        "Build a strong portfolio of projects",
        "Network with industry professionals",
      ],
    },
    resources: {
      books: [
        "Career Guide for Indian Students",
        "Discovering Your Career Path",
        "Skills for Success",
      ],
      websites: [
        "https://www.careers360.com",
        "https://www.collegedunia.com",
        "https://www.shiksha.com",
      ],
      courses: [
        "Online skill development courses",
        "Career counseling workshops",
        "Industry-specific training programs",
      ],
    },
    generatedAt: new Date(),
    modelUsed: "fallback-analysis",
  };
};

/**
 * Get subjects by stream
 */
const getSubjectsByStream = (stream) => {
  const streamSubjects = {
    "Science (PCM)": [
      "Physics",
      "Chemistry",
      "Mathematics",
      "Computer Science",
      "English",
    ],
    "Science (PCB)": [
      "Physics",
      "Chemistry",
      "Biology",
      "English",
      "Optional: Psychology/Computer Science",
    ],
    Commerce: [
      "Accountancy",
      "Business Studies",
      "Economics",
      "Mathematics",
      "English",
    ],
    "Arts/Humanities": [
      "History",
      "Political Science",
      "Psychology",
      "Sociology",
      "English",
    ],
  };

  return (streamSubjects[stream] || streamSubjects["Science (PCM)"]).map(
    (subject, index) => ({
      subject,
      importance: index < 3 ? "Core" : "Supporting",
      description: `Essential for ${stream} stream`,
    })
  );
};

/**
 * Get career paths by RIASEC traits
 */
const getCareerPathsByTrait = (trait1, trait2) => {
  const careerMap = {
    Realistic: {
      title: "Engineering & Technology",
      description:
        "Work with machines, tools, and physical objects in technical fields",
      entranceExams: ["JEE Main", "JEE Advanced", "BITSAT"],
      topColleges: ["IIT Delhi", "IIT Bombay", "NIT Trichy"],
    },
    Investigative: {
      title: "Research & Sciences",
      description: "Conduct research, analyze data, and solve complex problems",
      entranceExams: ["NEET", "KVPY", "IISc Entrance"],
      topColleges: ["IISc Bangalore", "AIIMS Delhi", "TIFR Mumbai"],
    },
    Artistic: {
      title: "Creative Arts & Design",
      description: "Express creativity through art, design, and media",
      entranceExams: ["NIFT", "NID", "UCEED"],
      topColleges: ["NID Ahmedabad", "NIFT Delhi", "IIT Bombay (Design)"],
    },
    Social: {
      title: "Social Services & Education",
      description: "Help others, teach, and work in community development",
      entranceExams: ["CUET", "DU Entrance", "TISS Entrance"],
      topColleges: ["DU", "JNU", "TISS Mumbai"],
    },
    Enterprising: {
      title: "Business & Management",
      description: "Lead teams, manage businesses, and drive growth",
      entranceExams: ["CAT", "XAT", "CLAT"],
      topColleges: ["IIM Ahmedabad", "XLRI Jamshedpur", "FMS Delhi"],
    },
    Conventional: {
      title: "Finance & Administration",
      description: "Organize data, manage systems, and ensure accuracy",
      entranceExams: ["CA Foundation", "CS Foundation", "IPCC"],
      topColleges: [
        "Shri Ram College of Commerce",
        "St. Xavier's Mumbai",
        "SRCC Delhi",
      ],
    },
  };

  const primary = careerMap[trait1] || careerMap.Realistic;
  const secondary = careerMap[trait2] || careerMap.Investigative;

  return [
    { ...primary, ranking: 1, matchScore: "95%" },
    { ...secondary, ranking: 2, matchScore: "85%" },
    {
      title: "Interdisciplinary Fields",
      description: "Combine multiple interests for unique career paths",
      entranceExams: ["Various competitive exams"],
      topColleges: ["Leading universities nationwide"],
      ranking: 3,
      matchScore: "75%",
    },
  ];
};

export default {
  generateCareerAnalysis,
  generateSubjectRecommendations,
};
