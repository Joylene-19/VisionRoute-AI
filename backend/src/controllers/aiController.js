import ChatHistory from "../models/ChatHistory.js";
import Assessment from "../models/Assessment.js";
import { geminiModel } from "../config/gemini.js";
import { groqClient } from "../config/openai.js";

/**
 * Send a message to the AI Career Chatbot
 */
export const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user._id;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    // Get or create active chat session
    let chatSession;
    if (sessionId) {
      chatSession = await ChatHistory.findOne({ userId, sessionId });
      if (!chatSession) {
        return res.status(404).json({ message: "Chat session not found" });
      }
    } else {
      chatSession = await ChatHistory.getActiveSession(userId);
    }

    // Fetch user's latest assessment for context
    const latestAssessment = await Assessment.findOne({ userId })
      .sort({ createdAt: -1 })
      .populate("userId", "fullName email");

    // Update chat context with latest assessment data
    if (latestAssessment && latestAssessment.isCompleted) {
      chatSession.context = {
        assessmentResults: latestAssessment.results,
        careerInterests: latestAssessment.results?.riasec?.topThreeTypes || [],
        aptitudeScores: latestAssessment.results?.aptitudes || {},
        userProfile: {
          currentGrade: req.user.currentGrade,
          stream: req.user.stream,
          subjects: req.user.subjects,
        },
      };
      await chatSession.save();
    }

    // Generate AI response
    let aiResponse;

    // Build system prompt with user context
    const systemPrompt = buildSystemPrompt(chatSession.context, req.user);
    const conversationHistory = chatSession.getConversationContext(10);

    if (!groqClient) {
      throw new Error(
        "Groq AI client not initialized. Please check your API key."
      );
    }

    // Prepare messages for Groq
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      // Add conversation history
      ...conversationHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.parts[0].text,
      })),
      // Add current message
      {
        role: "user",
        content: message,
      },
    ];

    // Call Groq API (Super fast & FREE!)
    const completion = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Best free model
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    aiResponse = completion.choices[0].message.content;

    // Save both messages to chat history
    await chatSession.addMessage("user", message);
    await chatSession.addMessage("assistant", aiResponse);

    res.json({
      success: true,
      message: aiResponse,
      sessionId: chatSession.sessionId,
      hasContext: !!latestAssessment?.isCompleted,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      errorDetails: error.errorDetails,
      body: error.body,
    });

    // Provide a helpful fallback response
    res.status(500).json({
      message:
        "I'm having trouble connecting to the AI service right now. Please try again in a moment.",
      error: error.message,
    });
  }
};

/**
 * Get chat history for the current user
 */
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId, limit = 50 } = req.query;

    let query = { userId };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const chatSessions = await ChatHistory.find(query)
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      sessions: chatSessions,
    });
  } catch (error) {
    console.error("Get Chat History Error:", error);
    res.status(500).json({
      message: "Failed to retrieve chat history",
      error: error.message,
    });
  }
};

/**
 * Get active chat session
 */
export const getActiveSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const session = await ChatHistory.getActiveSession(userId);

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Get Active Session Error:", error);
    res.status(500).json({
      message: "Failed to get active session",
      error: error.message,
    });
  }
};

/**
 * Clear chat history (start new session)
 */
export const clearHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.body;

    if (sessionId) {
      // Mark specific session as inactive
      await ChatHistory.findOneAndUpdate(
        { userId, sessionId },
        { isActive: false }
      );
    } else {
      // Mark all sessions as inactive
      await ChatHistory.updateMany(
        { userId, isActive: true },
        { isActive: false }
      );
    }

    // Create new session
    const newSession = await ChatHistory.create({
      userId,
      sessionId: `session_${Date.now()}`,
      messages: [],
      context: {},
    });

    res.json({
      success: true,
      message: "Chat history cleared",
      sessionId: newSession.sessionId,
    });
  } catch (error) {
    console.error("Clear History Error:", error);
    res.status(500).json({
      message: "Failed to clear chat history",
      error: error.message,
    });
  }
};

/**
 * Build system prompt with user context
 */
function buildSystemPrompt(context, user) {
  let prompt = `You are VisionRoute AI, an expert career counselor and guidance assistant for Indian students. Your role is to provide personalized, actionable career advice based on the student's assessment results and profile.

**User Profile:**
- Name: ${user.fullName}
- Current Grade: ${user.currentGrade || "Not specified"}
- Stream: ${user.stream || "Not specified"}
- Subjects: ${user.subjects?.join(", ") || "Not specified"}
`;

  if (context.assessmentResults) {
    prompt += `\n**Assessment Results:**`;

    // RIASEC Results
    if (context.careerInterests?.length > 0) {
      prompt += `\n- Career Interests (RIASEC): ${context.careerInterests.join(
        ", "
      )}`;
    }

    // Aptitude Scores
    if (
      context.aptitudeScores &&
      Object.keys(context.aptitudeScores).length > 0
    ) {
      prompt += `\n- Aptitude Scores:`;
      Object.entries(context.aptitudeScores).forEach(([skill, score]) => {
        prompt += `\n  * ${skill}: ${score}/100`;
      });
    }

    // Career Matches
    if (context.assessmentResults.careerMatches?.length > 0) {
      prompt += `\n- Top Career Matches:`;
      context.assessmentResults.careerMatches
        .slice(0, 5)
        .forEach((career, idx) => {
          prompt += `\n  ${idx + 1}. ${career.title} (Match: ${
            career.matchPercentage
          }%)`;
        });
    }
  } else {
    prompt += `\n**Note:** This student hasn't completed their career assessment yet. Encourage them to take the assessment for more personalized guidance.`;
  }

  prompt += `\n\n**Guidelines:**
1. Provide specific, actionable advice tailored to Indian education system
2. Reference their assessment results when giving recommendations
3. Suggest relevant courses, colleges, and career paths in India
4. Be encouraging and supportive
5. Use clear, concise language
6. Format responses with markdown for better readability (use **bold**, *italic*, lists, etc.)
7. When discussing careers, mention:
   - Required qualifications and entrance exams (JEE, NEET, CLAT, etc.)
   - Top colleges/universities in India
   - Career prospects and growth opportunities
   - Skills to develop
8. Keep responses focused and under 500 words unless detailed analysis is requested

**Conversation Style:**
- Professional yet friendly
- Use examples relevant to Indian students
- Acknowledge their strengths from assessment results
- Provide balanced perspectives on different career paths`;

  return prompt;
}

/**
 * Generate fallback response when AI service fails
 */
function generateFallbackResponse(message, assessment, user) {
  const msg = message.toLowerCase();

  // After 12th / What next questions
  if (
    msg.includes("12th") ||
    msg.includes("12") ||
    msg.includes("what next") ||
    msg.includes("after class") ||
    msg.includes("graduation")
  ) {
    return "**What to do after 12th?** 🎓\n\nYour options depend on your stream:\n\n**Science Students (PCM):**\n• B.Tech/B.E. - Engineering (4 years)\n• B.Arch - Architecture (5 years)\n• B.Sc - Pure Sciences (3 years)\n• Integrated M.Sc (5 years)\n• Diploma courses\n\n**Science Students (PCB):**\n• MBBS - Medicine (5.5 years)\n• BDS - Dentistry (5 years)\n• B.Pharm - Pharmacy (4 years)\n• B.Sc Nursing (4 years)\n• BAMS/BHMS - Ayurveda/Homeopathy\n\n**Commerce Students:**\n• B.Com - Commerce (3 years)\n• BBA/BBM - Business Management (3 years)\n• CA - Chartered Accountancy\n• CS - Company Secretary\n• B.Com (Hons)\n\n**Arts/Humanities:**\n• BA - Arts (3 years)\n• BBA LLB - Law (5 years)\n• B.Des - Design (4 years)\n• Journalism & Mass Communication\n• Hotel Management\n\n**Popular Career Paths 2026:**\n1. Computer Science & AI\n2. Data Science\n3. Medicine & Healthcare\n4. Business & Management\n5. Digital Marketing\n\n**Next Steps:**\n1. Take career assessment for personalized guidance\n2. Research entrance exams (JEE, NEET, CLAT, etc.)\n3. Visit college websites\n4. Talk to current students\n\nWhich stream are you from? I can give more specific guidance!";
  }

  // Career path guidance
  if (
    msg.includes("career") ||
    msg.includes("path") ||
    msg.includes("field") ||
    msg.includes("job") ||
    msg.includes("profession")
  ) {
    if (assessment?.isCompleted) {
      const topCareers = assessment.results?.careerMatches?.slice(0, 3) || [];
      if (topCareers.length > 0) {
        return `Based on your assessment results, your top career matches are:\n\n${topCareers
          .map(
            (c, i) =>
              `${i + 1}. **${c.title}** (${
                c.matchPercentage
              }% match)\n   ${c.description?.slice(0, 100)}...`
          )
          .join(
            "\n\n"
          )}\n\nThese careers align well with your aptitudes and interests. Would you like to know more about any specific career?`;
      }
    }
    return "Based on current trends in India, some high-demand career fields include:\n\n1. **Technology & IT** - Software Development, Data Science, Cybersecurity\n2. **Healthcare** - Medicine, Nursing, Biotechnology\n3. **Engineering** - Civil, Mechanical, Computer Science\n4. **Business & Finance** - CA, MBA, Digital Marketing\n5. **Creative Fields** - Design, Content Creation, Animation\n\nWould you like specific guidance on any of these fields?";
  }

  // Stream selection
  if (
    msg.includes("stream") ||
    msg.includes("class 11") ||
    msg.includes("pcm") ||
    msg.includes("commerce")
  ) {
    return "**Choosing the right stream in Class 11:**\n\n📚 **Science (PCM)**\n- For Engineering, Architecture, Research\n- Opens doors to IIT, NIT, BITS\n\n🧬 **Science (PCB)**\n- For Medicine, Dentistry, Pharmacy\n- Pathway to NEET, AIIMS\n\n💼 **Commerce**\n- For CA, CS, Business Management\n- Good for entrepreneurship\n\n🎨 **Arts/Humanities**\n- For Law, Design, Psychology, Journalism\n\nYour choice should align with your interests and strengths. Would you like help deciding based on your profile?";
  }

  // Engineering vs Medical
  if (msg.includes("engineering") && msg.includes("medical")) {
    return "**Engineering vs Medical Careers in India:**\n\n⚙️ **Engineering:**\n- Duration: 4 years B.Tech\n- Main Exam: JEE Main & Advanced\n- Salary: ₹3-8 LPA (fresher)\n- Work-Life: Better balance, flexible hours\n- Specializations: CSE, ECE, Mechanical, etc.\n\n⚕️ **Medical:**\n- Duration: 5.5 years MBBS + internship\n- Main Exam: NEET\n- Salary: ₹6-12 LPA (after completion)\n- Work-Life: Demanding, long hours initially\n- Specializations: Surgeon, Physician, etc.\n\n**Choose Engineering if:** You enjoy problem-solving, coding, building things\n**Choose Medical if:** You want to help people directly, interested in biology\n\nBoth are excellent careers! What matters is your passion.";
  }

  // College guidance
  if (
    msg.includes("college") ||
    msg.includes("university") ||
    msg.includes("iit") ||
    msg.includes("nit")
  ) {
    return "**Top Engineering Colleges in India:**\n\n🏆 **Tier 1:**\n- IIT (23 campuses) - JEE Advanced\n- NIT (31 campuses) - JEE Main\n- BITS Pilani - BITSAT\n\n📚 **Tier 2:**\n- IIIT (Hyderabad, Bangalore, etc.)\n- DTU, NSUT Delhi\n- VIT, Manipal, SRM\n\n**For Medical:**\n- AIIMS (All India)\n- JIPMER\n- State Medical Colleges\n\nFocus on JEE/NEET preparation. Start early, practice consistently!";
  }

  // Entrance exams
  if (
    msg.includes("exam") ||
    msg.includes("jee") ||
    msg.includes("neet") ||
    msg.includes("preparation")
  ) {
    return "**Major Entrance Exams in India (2026):**\n\n📐 **Engineering:**\n- JEE Main (Jan & April)\n- JEE Advanced (May)\n- BITSAT, VITEEE, MHT-CET\n\n🩺 **Medical:**\n- NEET UG (May)\n- AIIMS, JIPMER\n\n📊 **Other:**\n- CLAT (Law)\n- NIFT, NID (Design)\n- CA Foundation, CS\n\n**Preparation Tips:**\n1. Start early (Class 11)\n2. Focus on NCERT thoroughly\n3. Solve previous years' papers\n4. Join test series\n5. Stay consistent!\n\nWhich exam are you targeting?";
  }

  // Skills development
  if (
    msg.includes("skill") ||
    msg.includes("learn") ||
    msg.includes("develop")
  ) {
    return "**Essential Skills to Develop:**\n\n💻 **Technical Skills:**\n- Programming (Python, Java)\n- Data Analysis\n- Web Development\n- Digital Marketing\n\n🧠 **Soft Skills:**\n- Communication\n- Problem-solving\n- Time management\n- Leadership\n\n📚 **How to Learn:**\n1. Online platforms: Coursera, Udemy, YouTube\n2. College clubs and competitions\n3. Internships and projects\n4. Reading and research\n\nStart with areas that interest you most!";
  }

  // Greetings
  if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
    return `Hi there! 👋 I'm your AI Career Counselor. I can help you with:\n\n✅ Career path guidance\n✅ College selection\n✅ Stream selection (Class 11/12)\n✅ Entrance exam preparation\n✅ Skill development\n\n${
      assessment?.isCompleted
        ? "I can see you've completed your assessment! "
        : ""
    }How can I assist you today?`;
  }

  // Guide/help
  if (msg.includes("guide") || msg.includes("help")) {
    return `I'm here to guide you on your career journey! 🎯\n\n**I can help you with:**\n\n📚 **Academic Guidance:**\n- Choosing the right stream\n- College selection\n- Course recommendations\n\n💼 **Career Planning:**\n- Career path options\n- Industry insights\n- Skill development\n\n📝 **Exam Preparation:**\n- JEE, NEET guidance\n- Study strategies\n- Time management tips\n\nWhat specific topic would you like guidance on?`;
  }

  // Default response
  return `Thank you for your question! I'm here to help with career guidance. I can assist you with:\n\n• Career path recommendations\n• Stream selection (Science/Commerce/Arts)\n• College and entrance exam guidance\n• Skill development suggestions\n• Study planning and preparation tips\n\n${
    assessment?.isCompleted
      ? "**Based on your assessment results, I can provide personalized recommendations!** "
      : "Consider taking our career assessment for personalized guidance. "
  }\n\nPlease feel free to ask about any career-related topic!`;
}

/**
 * Get suggested questions based on user context
 */
export const getSuggestedQuestions = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch latest assessment
    const latestAssessment = await Assessment.findOne({ userId }).sort({
      createdAt: -1,
    });

    let suggestions = [];

    if (latestAssessment?.isCompleted) {
      // Context-aware suggestions
      suggestions = [
        "What are the best career paths based on my assessment results?",
        "Which colleges in India should I target for my top career matches?",
        "What skills should I develop to excel in my recommended careers?",
        "Can you compare my top 3 career matches?",
        "What entrance exams should I prepare for?",
        "How can I improve my weaker aptitude areas?",
      ];
    } else {
      // General suggestions for users without assessment
      suggestions = [
        "How does the career assessment work?",
        "What career options are available after Class 12?",
        "Tell me about engineering vs medical careers in India",
        "What are the emerging career fields in 2026?",
        "How do I choose the right stream in Class 11?",
        "What are the top entrance exams in India?",
      ];
    }

    res.json({
      success: true,
      suggestions,
      hasAssessment: !!latestAssessment?.isCompleted,
    });
  } catch (error) {
    console.error("Get Suggestions Error:", error);
    res.status(500).json({
      message: "Failed to get suggested questions",
      error: error.message,
    });
  }
};
