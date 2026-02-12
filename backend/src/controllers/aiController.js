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

    // Check if user is requesting a study roadmap
    const isRoadmapRequest = /\b(roadmap|study plan|learning path)\b/i.test(
      message,
    );

    if (isRoadmapRequest) {
      // Extract career from message or use top career from assessment
      let careerName = extractCareerFromMessage(message);

      if (!careerName && latestAssessment?.results?.careerMatches?.length > 0) {
        careerName = latestAssessment.results.careerMatches[0].title;
      }

      if (careerName) {
        const roadmap = generateStudyRoadmap(careerName, req.user);

        // Save messages
        await chatSession.addMessage("user", message);
        await chatSession.addMessage("assistant", roadmap);

        return res.json({
          success: true,
          message: roadmap,
          sessionId: chatSession.sessionId,
          hasContext: !!latestAssessment?.isCompleted,
          isRoadmap: true,
        });
      }
    }

    // Generate AI response
    let aiResponse;

    // Build system prompt with user context
    const systemPrompt = buildSystemPrompt(chatSession.context, req.user);
    const conversationHistory = chatSession.getConversationContext(10);

    if (!groqClient) {
      throw new Error(
        "Groq AI client not initialized. Please check your API key.",
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
        { isActive: false },
      );
    } else {
      // Mark all sessions as inactive
      await ChatHistory.updateMany(
        { userId, isActive: true },
        { isActive: false },
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
        ", ",
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
              }% match)\n   ${c.description?.slice(0, 100)}...`,
          )
          .join(
            "\n\n",
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
        "Generate a study roadmap for my top career match",
        "Can you compare my top 3 career matches?",
        "What entrance exams should I prepare for?",
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

/**
 * Extract career name from user message
 */
function extractCareerFromMessage(message) {
  const lowerMsg = message.toLowerCase();

  // Common career keywords
  const careers = [
    "software engineer",
    "software developer",
    "web developer",
    "data scientist",
    "doctor",
    "physician",
    "surgeon",
    "medical",
    "engineer",
    "civil engineer",
    "mechanical engineer",
    "electrical engineer",
    "teacher",
    "professor",
    "educator",
    "lawyer",
    "advocate",
    "attorney",
    "architect",
    "designer",
    "graphic designer",
    "accountant",
    "chartered accountant",
    "ca",
    "business analyst",
    "consultant",
    "manager",
    "nurse",
    "pharmacist",
    "physiotherapist",
    "psychologist",
    "counselor",
    "therapist",
    "pilot",
    "aviation",
    "airline pilot",
    "chef",
    "culinary",
    "hospitality",
    "journalist",
    "writer",
    "content creator",
    "photographer",
    "videographer",
    "filmmaker",
  ];

  for (const career of careers) {
    if (lowerMsg.includes(career)) {
      return career
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
  }

  return null;
}

/**
 * Generate a study roadmap for a specific career
 */
function generateStudyRoadmap(careerName, user) {
  const currentGrade = user.currentGrade || "Class 12";
  const stream = user.stream || "Not specified";

  // Categorize career
  const careerLower = careerName.toLowerCase();
  let roadmapTemplate;

  if (
    careerLower.includes("software") ||
    careerLower.includes("developer") ||
    careerLower.includes("data scientist")
  ) {
    roadmapTemplate = getTechRoadmap(careerName, currentGrade, stream);
  } else if (
    careerLower.includes("doctor") ||
    careerLower.includes("medical") ||
    careerLower.includes("physician")
  ) {
    roadmapTemplate = getMedicalRoadmap(careerName, currentGrade, stream);
  } else if (careerLower.includes("engineer")) {
    roadmapTemplate = getEngineeringRoadmap(careerName, currentGrade, stream);
  } else if (careerLower.includes("ca") || careerLower.includes("accountant")) {
    roadmapTemplate = getCommerceRoadmap(careerName, currentGrade, stream);
  } else if (
    careerLower.includes("lawyer") ||
    careerLower.includes("advocate")
  ) {
    roadmapTemplate = getLawRoadmap(careerName, currentGrade, stream);
  } else {
    roadmapTemplate = getGenericRoadmap(careerName, currentGrade, stream);
  }

  return roadmapTemplate;
}

/**
 * Tech career roadmap template
 */
function getTechRoadmap(careerName, grade, stream) {
  return `# 📚 Study Roadmap for ${careerName}

**Your Profile:** ${grade} | Stream: ${stream}

## 🎯 12-Month Learning Path

### Month 1-2: Foundation Building
**Focus:** Programming Fundamentals
- **Topics:**
  - Choose a programming language (Python recommended for beginners)
  - Variables, data types, operators
  - Control structures (if-else, loops)
  - Functions and modules
- **Resources:**
  - Codecademy Python Course
  - CS50's Introduction to Programming (Harvard - Free)
  - Practice on HackerRank/LeetCode Easy problems
- **Milestone:** Build a simple calculator and basic games

### Month 3-4: Data Structures & Algorithms
**Focus:** Core CS Concepts
- **Topics:**
  - Arrays, Linked Lists, Stacks, Queues
  - Trees, Graphs, Hash Tables
  - Sorting & Searching algorithms
  - Time & Space complexity (Big O)
- **Resources:**
  - "Grokking Algorithms" book
  - Abdul Bari's YouTube channel
  - LeetCode/GeeksforGeeks practice
- **Milestone:** Solve 50+ DSA problems

### Month 5-6: Web Development Basics
**Focus:** Frontend Technologies
- **Topics:**
  - HTML5 & CSS3
  - JavaScript fundamentals
  - Responsive design (Flexbox, Grid)
  - Bootstrap/Tailwind CSS
- **Resources:**
  - FreeCodeCamp Web Design Certification
  - MDN Web Docs
  - Build 5 static websites
- **Milestone:** Create a personal portfolio website

### Month 7-8: Advanced Web Development
**Focus:** Modern Frameworks
- **Topics:**
  - React.js fundamentals
  - Component lifecycle, Hooks
  - State management (Context, Redux)
  - API integration
- **Resources:**
  - React official documentation
  - "Full Stack Open" course (University of Helsinki)
  - Build 3 React projects
- **Milestone:** Deploy a full-stack web application

### Month 9-10: Backend Development
**Focus:** Server-Side Programming
- **Topics:**
  - Node.js & Express.js
  - RESTful APIs
  - Database fundamentals (MongoDB/PostgreSQL)
  - Authentication & Authorization
- **Resources:**
  - Traversy Media YouTube tutorials
  - "Node.js Design Patterns" book
  - Build API projects
- **Milestone:** Create a complete CRUD application

### Month 11-12: Specialization & Portfolio
**Focus:** Advanced Topics & Projects
- **Topics:**
  - Choose specialization (AI/ML, Web3, Mobile Dev, Cloud)
  - System Design basics
  - Git & GitHub mastery
  - DevOps fundamentals (Docker basics)
- **Resources:**
  - Coursera specialization courses
  - Build 2-3 impressive portfolio projects
  - Contribute to open source
- **Milestone:** Complete portfolio with 5+ projects

## 📝 Entrance Exams to Prepare For:
${
  stream.includes("Science") || stream.includes("PCM")
    ? `
- **JEE Main** (For IITs, NITs - Computer Science)
- **BITSAT** (BITS Pilani)
- **VITEEE** (VIT University)
- **SRMJEEE** (SRM University)
`
    : `
- Focus on **Aptitude Tests** for private colleges
- **SAT/ACT** (if considering abroad)
`
}

## 🎓 Top Colleges in India:
1. IIT Bombay, Delhi, Madras (JEE Advanced)
2. BITS Pilani (BITSAT)
3. IIIT Hyderabad, Bangalore
4. NIT Trichy, Surathkal, Warangal
5. DTU, NSUT Delhi
6. VIT, Manipal, SRM (Private)

## 💡 Additional Tips:
- **Daily Practice:** Code for at least 1-2 hours daily
- **Projects:** Build real-world projects, not just tutorials
- **Networking:** Join tech communities (Discord, Reddit, LinkedIn)
- **Internships:** Look for internships after Month 8
- **Interview Prep:** Start LeetCode Medium/Hard problems from Month 9

## 🚀 Next Steps:
1. Set up your development environment (VS Code, Git)
2. Create GitHub account and start committing code
3. Join online communities (r/learnprogramming, dev.to)
4. Follow tech blogs and YouTube channels
5. Track your progress weekly

**Remember:** Consistency is key! Even 1 hour daily is better than 10 hours once a week.

Need help with any specific month or topic? Just ask! 💬`;
}

/**
 * Medical career roadmap
 */
function getMedicalRoadmap(careerName, grade, stream) {
  return `# 🩺 Study Roadmap for ${careerName}

**Your Profile:** ${grade} | Stream: ${stream}

## 🎯 12-Month Preparation Plan

### Month 1-2: NEET Foundation - Physics
**Focus:** Complete Class 11 Physics
- **Topics:**
  - Mechanics (Kinematics, Laws of Motion, Work Energy)
  - Thermodynamics
  - Waves & Oscillations
- **Resources:**
  - NCERT Class 11 Physics (Read 3 times minimum)
  - HC Verma "Concepts of Physics" Vol 1
  - Previous Year NEET questions topic-wise
- **Daily Schedule:** 3 hours Physics
- **Milestone:** Solve 500+ MCQs

### Month 3-4: NEET Foundation - Chemistry
**Focus:** Organic & Inorganic Chemistry
- **Topics:**
  - Organic: Basic concepts, Hydrocarbons, Functional groups
  - Inorganic: Periodic table, Chemical bonding, s & p block
  - Physical: Atomic structure, States of matter
- **Resources:**
  - NCERT Class 11 & 12 Chemistry
  - OP Tandon (Organic & Inorganic)
  - MS Chauhan (Organic)
- **Daily Schedule:** 3 hours Chemistry
- **Milestone:** Complete NCERT exemplar

### Month 5-6: NEET Foundation - Biology
**Focus:** Botany & Zoology
- **Topics:**
  - Botany: Plant Kingdom, Morphology, Anatomy
  - Zoology: Animal Kingdom, Human Physiology
  - Cell Biology, Genetics
- **Resources:**
  - NCERT Class 11 & 12 Biology (Most important!)
  - Trueman's Biology Vol 1 & 2
  - NEET previous year topic-wise
- **Daily Schedule:** 4 hours Biology (highest weightage)
- **Milestone:** Memorize all NCERT diagrams

### Month 7-8: Revision & Problem Solving
**Focus:** All subjects revision round 1
- **Topics:**
  - Complete Class 12 Physics (Modern Physics, Electromagnetism)
  - Complete Class 12 Chemistry (Electrochemistry, p,d,f block)
  - Complete Class 12 Biology (Reproduction, Ecology, Biotechnology)
- **Practice:**
  - Solve 100 questions daily (45 Physics, 45 Chemistry, 90 Biology)
  - MTG NEET Champion Series
  - Arihant 40 Days Series
- **Milestone:** Complete entire syllabus once

### Month 9-10: Intensive Practice & Mock Tests
**Focus:** Speed & Accuracy
- **Strategy:**
  - Take 2 full-length mock tests per week
  - Analyze mistakes thoroughly
  - Create error log & weak topic list
  - Revise weak topics daily
- **Mock Test Sources:**
  - Allen/Aakash Test Series
  - NTA NEET Mock Tests (Official)
  - Previous 10 years NEET papers
- **Time Management:**
  - Physics: 45 min (45 Q)
  - Chemistry: 45 min (45 Q)
  - Biology: 90 min (90 Q)
- **Milestone:** Score 600+ in mocks consistently

### Month 11-12: Final Revision & Strategy
**Focus:** Revision + Last-minute prep
- **Week-wise Plan:**
  - Week 1-2: Complete revision of all 3 subjects
  - Week 3: Formula sheets, diagrams, reactions
  - Week 4-6: Daily mock tests + analysis
  - Week 7-8: Revise NCERT only (cover to cover)
  - Last week: Relax, light revision, stay positive
- **Don't Study New Topics!** Revise what you know
- **Milestone:** Peak confidence, calm mindset

## 📝 NEET 2026 Exam Pattern:
- **Total Questions:** 180 (45 Physics, 45 Chemistry, 90 Biology)
- **Duration:** 3 hours 20 minutes
- **Marking:** +4 for correct, -1 for incorrect
- **Qualifying Percentile:** 50% (General), 40% (OBC), 40% (SC/ST)
- **Total Marks:** 720

## 🎓 Top Medical Colleges in India:
1. **AIIMS Delhi** (Most prestigious)
2. AIIMS (All campuses - Bhopal, Jodhpur, Rishikesh, etc.)
3. JIPMER Puducherry
4. Maulana Azad Medical College, Delhi
5. King George's Medical University, Lucknow
6. Christian Medical College (CMC), Vellore
7. Armed Forces Medical College (AFMC), Pune
8. State Government Medical Colleges (check your state quota)

## 💡 Study Strategy:
- **NCERT is King:** 80% questions directly from NCERT
- **Read NCERT 5 Times:** Not just once!
- **Make Notes:** Handwritten notes for quick revision
- **Previous Years:** Solve last 15 years NEET papers
- **Daily Routine:**
  - 6 AM - 9 AM: Biology (fresh mind)
  - 10 AM - 1 PM: Chemistry
  - 2 PM - 5 PM: Physics
  - 6 PM - 9 PM: Revision + Mock tests
  - 9 PM - 10 PM: Relaxation/Exercise

## 🚀 Additional Resources:
- **YouTube Channels:** Physics Wallah (Alakh Pandey), Unacademy JEE
- **Apps:** NEET Prep by Gradeup, Embibe
- **Coaching:** Allen, Aakash, Resonance (if needed)

## ⚠️ Important Reminders:
- Focus on **NCERT** more than any other book
- Don't skip **Class 11** topics (50% weightage)
- **Biology** has highest weightage (360/720 marks)
- Stay healthy: 7-8 hours sleep, regular exercise
- Avoid social media during preparation

**You've got this! Stay focused and consistent.** 💪

Need specific help with any subject or topic? Let me know! 💬`;
}

/**
 * Engineering career roadmap
 */
function getEngineeringRoadmap(careerName, grade, stream) {
  return `# ⚙️ Study Roadmap for ${careerName}

**Your Profile:** ${grade} | Stream: ${stream}

## 🎯 12-Month JEE Preparation Plan

### Month 1-2: Mathematics Foundation
**Focus:** Class 11 Core Topics
- **Topics:**
  - Trigonometry & Inverse Trigonometry
  - Coordinate Geometry (Straight Lines, Circles)
  - Limits & Derivatives (Calculus basics)
- **Resources:**
  - NCERT Class 11 Maths
  - RD Sharma Class 11
  - Cengage Mathematics (G. Tewani)
- **Practice:** 50 problems daily
- **Milestone:** Complete Class 11 Math

### Month 3-4: Physics Foundation
**Focus:** Mechanics & Thermodynamics
- **Topics:**
  - Kinematics, Newton's Laws, Work-Energy
  - Rotational Motion, Gravitation
  - Simple Harmonic Motion
  - Thermodynamics basics
- **Resources:**
  - NCERT Class 11 Physics
  - HC Verma "Concepts of Physics"
  - DC Pandey (Mechanics 1 & 2)
- **Milestone:** Solve all HC Verma exercises

### Month 5-6: Chemistry Foundation
**Focus:** Physical & Inorganic Chemistry
- **Topics:**
  - Atomic Structure, Chemical Bonding
  - Thermodynamics, Equilibrium
  - s-block, p-block elements
  - Organic basics (Hydrocarbons)
- **Resources:**
  - NCERT Class 11 Chemistry
  - OP Tandon (Physical & Inorganic)
  - MS Chauhan (Organic)
- **Milestone:** Complete NCERT + exemplar

### Month 7-8: Advanced Topics
**Focus:** Class 12 Core Concepts
- **Maths:**
  - Matrices & Determinants
  - Integration & Differential Equations
  - Vector Algebra, 3D Geometry
- **Physics:**
  - Electrostatics, Current Electricity
  - Magnetic Effects, Electromagnetic Induction
  - Optics, Modern Physics
- **Chemistry:**
  - Electrochemistry, d & f block
  - Coordination Compounds
  - Aldehydes, Ketones, Carboxylic Acids
- **Milestone:** Complete Class 12 syllabus

### Month 9-10: Problem Solving & Practice
**Focus:** Previous Year Questions
- **Strategy:**
  - Solve JEE Main last 15 years papers
  - Topic-wise practice from Arihant
  - Focus on weak areas
  - Speed & accuracy drills
- **Daily Target:**
  - 30 Math problems
  - 30 Physics problems
  - 30 Chemistry problems
- **Milestone:** Solve 2000+ JEE level problems

### Month 11-12: Mock Tests & Revision
**Focus:** Full-length tests
- **Week 1-4:**
  - 2 JEE Main mocks per week
  - 1 JEE Advanced mock per week
  - Thorough analysis of each test
- **Week 5-8:**
  - Daily revision of formulas
  - Quick concept revision
  - Formula sheets & flashcards
  - Stay calm, stay confident
- **Milestone:** Consistent 200+ in JEE Main

## 📝 Entrance Exams Timeline:
- **JEE Main Session 1:** January (Online)
- **JEE Main Session 2:** April (Online)
- **JEE Advanced:** May (For IITs - top 2.5 lakh JEE Main qualifiers)
- **BITSAT:** May-June (BITS Pilani)
- **VITEEE, SRMJEEE:** April-May
- **State CETs:** April-May (MHT-CET, KCET, etc.)

## 🎓 Top Engineering Colleges:
**Tier 1 (JEE Advanced):**
1. IIT Bombay, Delhi, Madras, Kanpur
2. IIT Kharagpur, Roorkee, Guwahati

**Tier 2 (JEE Main):**
3. NIT Trichy, Surathkal, Warangal
4. IIIT Hyderabad, Bangalore, Allahabad
5. DTU, NSUT Delhi

**Tier 3 (Institute Tests):**
6. BITS Pilani, Goa, Hyderabad (BITSAT)
7. VIT Vellore, Manipal, SRM (Own tests)

## 💡 JEE Preparation Strategy:
- **80-20 Rule:** Focus on high-weightage topics
- **NCERT First:** Foundation = NCERT (especially Chemistry)
- **Practice > Theory:** Solve more, read less
- **Mock Tests:** Mandatory from Month 9
- **Revision:**
  - 1st revision: After 1 month
  - 2nd revision: After 2 months
  - 3rd revision: After 3 months
  - Final revision: Last month

## 📚 Time Distribution:
- **Mathematics:** 40% time (highest difficulty)
- **Physics:** 35% time (conceptual + numerical)
- **Chemistry:** 25% time (memory + reactions)

## 🚀 Daily Study Schedule:
- **6 AM - 8 AM:** Mathematics (2 hours)
- **9 AM - 12 PM:** Physics (3 hours)
- **1 PM - 3 PM:** Chemistry (2 hours)
- **4 PM - 6 PM:** Revision + Doubt Clearing (2 hours)
- **7 PM - 9 PM:** Practice Problems (2 hours)
- **9 PM - 10 PM:** Relaxation/Exercise

**Total Study Hours:** 10-11 hours/day

## ⚡ Quick Tips:
- **Focus Areas:**
  - Maths: Calculus, Algebra (60% weightage)
  - Physics: Mechanics, Electromagnetism (65% weightage)
  - Chemistry: Organic, Physical (70% weightage)
- **Don't Skip:** Class 11 topics (40-45% of JEE)
- **Use Coaching:** Allen, FIITJEE, Resonance (if needed)
- **Online Resources:** Unacademy, Physics Wallah, Vedantu

**Stay consistent and believe in yourself!** 🚀

Questions about specific subjects? Ask me! 💬`;
}

/**
 * Commerce career roadmap
 */
function getCommerceRoadmap(careerName, grade, stream) {
  return `# 💼 Study Roadmap for ${careerName}

**Your Profile:** ${grade} | Stream: ${stream}

## 🎯 12-Month CA Foundation & Preparation Plan

### Month 1-2: Accounting Fundamentals
**Focus:** Financial Accounting Basics
- **Topics:**
  - Accounting concepts & conventions
  - Journal, Ledger, Trial Balance
  - Bank Reconciliation
  - Depreciation (SLM, WDV)
  - Inventory Valuation (FIFO, LIFO, Weighted Average)
- **Resources:**
  - NCERT Class 11 Accountancy
  - TS Grewal Accountancy
  - CA Foundation Study Material (ICAI)
- **Practice:** Solve 20 numerical problems daily
- **Milestone:** Master basic accounting entries

### Month 2-4: Advanced Accounting
**Focus:** Partnership, Company Accounts
- **Topics:**
  - Partnership Accounts (Admission, Retirement, Dissolution)
  - Company Accounts (Share Capital, Debentures)
  - Financial Statements preparation
  - Cash Flow Statements
- **Resources:**
  - ICAI Study Material
  - Tulsian's Accountancy book
  - Previous CA Foundation papers
- **Milestone:** Prepare complete financial statements

### Month 5-6: Business Laws & Ethics
**Focus:** Legal Foundation
- **Topics:**
  - Indian Contract Act 1872
  - Sale of Goods Act 1930
  - Partnership Act 1932
  - Companies Act basics
  - Business Ethics & Communication
- **Resources:**
  - ICAI Study Material (Paper 2)
  - Taxmann's Business Laws
  - MCQ practice books
- **Milestone:** Complete all acts with case studies

### Month 7-8: Business Mathematics
**Focus:** Quantitative Aptitude
- **Topics:**
  - Ratio, Proportion, Indices
  - Logarithms, Equations
  - Time Value of Money (Simple & Compound Interest)
  - Permutation & Combination, Probability
  - Sets, Functions, Statistics
- **Resources:**
  - ICAI Study Material (Paper 3)
  - RS Aggarwal Quantitative Aptitude
  - Practice 50 problems daily
- **Milestone:** 90%+ accuracy in mocks

### Month 9-10: Business Economics
**Focus:** Micro & Macro Economics
- **Topics:**
  - Demand & Supply, Elasticity
  - Production, Cost, Revenue
  - Market Structures (Perfect Competition, Monopoly)
  - National Income, Money & Banking
  - Indian Economy overview
- **Resources:**
  - ICAI Study Material (Paper 4)
  - NCERT Class 11 & 12 Economics
  - Economic Survey (for current affairs)
- **Milestone:** Complete all theory + numericals

### Month 11-12: Revision & Mock Tests
**Focus:** CA Foundation Exam Preparation
- **Strategy:**
  - Take 2 full mock tests per week
  - Revise all 4 papers simultaneously
  - Create formula sheets & flowcharts
  - Focus on time management
  - Solve last 5 years' question papers
- **Paper-wise Time:**
  - Paper 1 (Accounts): 3 hours
  - Paper 2 (Laws): 2 hours
  - Paper 3 (Maths): 3 hours
  - Paper 4 (Economics): 3 hours
- **Milestone:** 60%+ in all mock tests

## 📝 CA Foundation Exam Pattern:
**Paper 1: Principles & Practice of Accounting**
- Marks: 100 | Duration: 3 hours
- Format: Theory + Practical problems

**Paper 2: Business Laws & Business Correspondence**
- Section A: Business Laws (60 marks)
- Section B: Business Correspondence (40 marks)

**Paper 3: Business Mathematics & Logical Reasoning**
- Section A: Business Maths (60 marks)
- Section B: Logical Reasoning (40 marks)

**Paper 4: Business Economics & Business Studies**
- Section A: Business Economics (60 marks)
- Section B: Business Studies (40 marks)

**Passing Criteria:**
- Minimum 40% in each paper
- Minimum 50% in aggregate

## 🎓 CA Course Path after Foundation:
1. **CA Foundation** (Current focus)
2. **CA Intermediate** (8 months articleship)
3. **CA Final** (Complete articleship 2.5 years)
4. **Qualified CA** (Practice or Job)

## 💡 Top Career Opportunities:
- **Public Practice:** Own CA firm, Tax consultancy
- **Corporate Jobs:**
  - Big 4 (Deloitte, PwC, EY, KPMG)
  - Investment Banking (Goldman Sachs, JP Morgan)
  - Financial Advisory (McKinsey, BCG)
- **Government:** RBI, SEBI, Income Tax Department
- **Entrepreneurship:** Financial Planning, Audit firms

## 📚 Additional Certifications (After CA):
- CFA (Chartered Financial Analyst)
- FRM (Financial Risk Manager)
- CPA (USA) for international career
- MBA from IIM (CA + MBA powerful combo)

## 🚀 Daily Study Schedule:
- **6 AM - 9 AM:** Accounting Practice (3 hours)
- **10 AM - 12 PM:** Business Laws (2 hours)
- **1 PM - 3 PM:** Business Maths (2 hours)
- **4 PM - 6 PM:** Economics Study (2 hours)
- **7 PM - 9 PM:** Revision + Mock Tests (2 hours)

**Total:** 11 hours/day

## ⚡ Success Tips:
- **Master Accounting:** 40% of CA is accounting
- **Conceptual Clarity:** Don't just memorize, understand
- **Regular Practice:** Daily numerical problem-solving
- **Time Management:** Crucial in CA exams
- **Stay Updated:** Read Business newspapers (ET, BS)
- **Join Coaching:** Optional but helpful (Unacademy, EduPrime)

## 📅 CA Foundation Exam Schedule:
- **Held twice a year:** May & November
- **Registration:** 3 months before exam
- **Study Duration:** 4-6 months recommended

**Stay disciplined and focused! CA is tough but worth it.** 💪

Need help with specific topics or papers? Let me know! 💬`;
}

/**
 * Law career roadmap
 */
function getLawRoadmap(careerName, grade, stream) {
  return `# ⚖️ Study Roadmap for ${careerName}

**Your Profile:** ${grade} | Stream: ${stream}

## 🎯 12-Month CLAT Preparation Plan

### Month 1-2: English Language Mastery
**Focus:** Reading Comprehension & Vocabulary
- **Topics:**
  - Grammar (Tenses, Articles, Prepositions)
  - Vocabulary (Synonyms, Antonyms, Idioms)
  - Reading Comprehension passages
  - Para jumbles, Fill in the blanks
- **Resources:**
  - Wren & Martin Grammar
  - Word Power Made Easy (Norman Lewis)
  - The Hindu/Indian Express daily editorials
  - Previous CLAT English sections
- **Daily Practice:**
  - Read 2 newspaper editorials
  - Learn 20 new words daily
  - Solve 5 RC passages
- **Milestone:** 90%+ accuracy in English

### Month 3-4: Current Affairs & GK
**Focus:** Legal, National & International Affairs
- **Topics:**
  - Current Affairs (last 1 year)
  - Static GK (Geography, History, Polity)
  - Legal GK (Important cases, amendments)
  - Who's Who, Awards, Sports
- **Resources:**
  - Monthly current affairs magazines (Pratiyogita Darpan)
  - Manorama Yearbook
  - Lucent's GK
  - The Hindu newspaper daily
- **Daily Routine:**
  - 1 hour newspaper reading
  - Make current affairs notes
  - GK MCQs practice (50 daily)
- **Milestone:** Create comprehensive GK notes

### Month 5-6: Legal Reasoning
**Focus:** Legal Principles & Application
- **Topics:**
  - Understanding legal principles
  - Applying principles to fact situations
  - Indian Penal Code basics
  - Contract Act, Torts basics
  - Constitutional Law articles
- **Resources:**
  - Universal's CLAT Legal Reasoning
  - Previous 10 years CLAT papers
  - Legal reasoning MCQ books
  - Important judgments & case laws
- **Practice:**
  - 20 legal reasoning questions daily
  - Read landmark Supreme Court cases
  - Understand ratio decidendi
- **Milestone:** Master legal principle application

### Month 7-8: Logical Reasoning
**Focus:** Analytical & Critical Thinking
- **Topics:**
  - Syllogisms, Blood Relations
  - Seating Arrangements, Puzzles
  - Coding-Decoding, Series
  - Analogies, Odd One Out
  - Critical Reasoning passages
- **Resources:**
  - RS Aggarwal Logical Reasoning
  - Arun Sharma Logical Reasoning
  - CLAT specific LR books
  - Online mock tests
- **Daily Practice:**
  - 30 LR questions daily
  - Timed practice (important!)
  - Analyze mistakes thoroughly
- **Milestone:** Solve puzzles in under 5 minutes

### Month 9-10: Quantitative Techniques
**Focus:** Basic Mathematics
- **Topics:**
  - Number Systems, Percentages
  - Ratio & Proportion, Averages
  - Time & Work, Speed & Distance
  - Profit & Loss, Simple & Compound Interest
  - Data Interpretation (Tables, Graphs)
- **Resources:**
  - RS Aggarwal Quantitative Aptitude
  - Quick Maths by M. Tyra
  - Previous CLAT Maths sections
- **Practice:**
  - 25 quant problems daily
  - Focus on speed calculation
  - Use shortcuts & tricks
- **Milestone:** Solve quant section in 20 minutes

### Month 11-12: Mock Tests & Final Revision
**Focus:** Full-length Tests & Strategy
- **Strategy:**
  - Take 3 full CLAT mocks per week
  - Analyze every mock thoroughly
  - Revise weak areas daily
  - Time management practice
  - Maintain accuracy over speed
- **Mock Test Sources:**
  - Career Launcher, IMS, CLATapult
  - Official CLAT mock tests
  - Previous 10 years papers (must solve)
- **Revision Plan:**
  - Week 1-4: Subject-wise revision
  - Week 5-6: Legal GK & cases revision
  - Week 7-8: Daily mocks + light revision
  - Last week: Stay calm, confidence building
- **Milestone:** Consistent 120+ score in mocks

## 📝 CLAT 2026 Exam Pattern:
**Total Questions:** 120 (2 hours duration)

**Section-wise Distribution:**
1. **English Language:** 22-26 questions (Comprehension-based)
2. **Current Affairs (incl. GK):** 35-39 questions
3. **Legal Reasoning:** 35-39 questions (Comprehension-based)
4. **Logical Reasoning:** 22-26 questions
5. **Quantitative Techniques:** 13-17 questions

**Marking Scheme:**
- +1 for correct answer
- -0.25 for incorrect answer
- **Maximum Marks:** 120

## 🎓 Top National Law Universities (NLUs):
**Tier 1:**
1. **NLSIU Bangalore** (Most prestigious)
2. NALSAR Hyderabad
3. NUJS Kolkata
4. NLU Delhi
5. WBNUJS Kolkata

**Tier 2:**
6. NLIU Bhopal
7. HNLU Raipur
8. RMLNLU Lucknow
9. RGNUL Patiala
10. CNLU Patna

**Total 22 NLUs** accept CLAT scores

## 💡 CLAT Preparation Strategy:
- **English is Key:** 20-25% weightage, easiest to score
- **Current Affairs:** Read newspapers daily (non-negotiable!)
- **Legal Reasoning:** Practice makes perfect
- **Logical Reasoning:** Improves with consistent practice
- **Quant:** Easiest section, don't skip

## 📚 Time Management in Exam:
- **English:** 25 minutes (22-26 Q)
- **Current Affairs:** 30 minutes (35-39 Q)
- **Legal Reasoning:** 35 minutes (35-39 Q)
- **Logical Reasoning:** 25 minutes (22-26 Q)
- **Quantitative:** 15 minutes (13-17 Q)
- **Buffer:** 10 minutes (revision/difficult Q)

## 🚀 Daily Study Routine:
- **6 AM - 8 AM:** English (Reading + Practice)
- **9 AM - 11 AM:** Current Affairs & GK
- **12 PM - 2 PM:** Legal Reasoning
- **3 PM - 5 PM:** Logical Reasoning
- **6 PM - 7 PM:** Quantitative Techniques
- **8 PM - 10 PM:** Mock Tests / Revision

**Total:** 10-11 hours/day

## ⚡ Important Resources:
**Newspapers (Must Read Daily):**
- The Hindu (Most important!)
- Indian Express
- Focus on: Editorials, Opinion, National/International news

**Magazines:**
- Pratiyogita Darpan (Current Affairs)
- Competition Success Review

**Online Platforms:**
- CLATapult, CLATGyan (Mock tests)
- Unacademy, LegalEdge (Online coaching)
- ipleaders.in (Legal articles)

## 📅 CLAT Exam Timeline:
- **CLAT 2026:** Expected in May 2026
- **Application:** Opens in January
- **Registration Deadline:** March-April
- **Admit Card:** 2 weeks before exam
- **Result:** June 2026
- **Counseling:** June-July 2026

## 💼 Career After Law:
**Options:**
1. **Litigation:** Supreme Court, High Courts practice
2. **Corporate Law:** Law firms (AZB, Cyril Amarchand, Khaitan)
3. **Judicial Services:** Become a Judge
4. **Legal Consultancy:** Corporate legal advisor
5. **Civil Services:** UPSC (IAS with law background)
6. **Academia:** Law professor, researcher
7. **International Law:** UN, International tribunals

**Average Salary:**
- Tier 1 NLU Graduate: ₹12-20 LPA starting
- Top law firms: ₹15-25 LPA
- After 5 years: ₹50 LPA - ₹1 Crore+

## ⚖️ Success Mantras:
- **Read Daily:** Newspapers are 50% of CLAT
- **Stay Updated:** Monthly current affairs revision
- **Practice Mocks:** Minimum 50 full-length tests
- **Accuracy > Speed:** Negative marking is harsh
- **Legal Awareness:** Follow landmark cases
- **Stay Consistent:** Law preparation needs discipline

**Believe in yourself and stay focused!** ⚖️

Questions about any section or NLU? Ask me! 💬`;
}

/**
 * Generic roadmap for other careers
 */
function getGenericRoadmap(careerName, grade, stream) {
  return `# 📚 Study Roadmap for ${careerName}

**Your Profile:** ${grade} | Stream: ${stream}

## 🎯 12-Month Career Preparation Plan

### Month 1-3: Foundation Building
**Focus:** Core Knowledge & Skills
- Research your career field thoroughly
- Understand required qualifications & certifications
- Identify top colleges/institutes for ${careerName}
- Learn industry terminology & basics
- Connect with professionals in the field (LinkedIn)

**Resources:**
- Online courses (Coursera, Udemy, edX)
- YouTube tutorials & lectures
- Industry-specific books & journals
- College websites & course catalogs

**Milestone:** Clear understanding of career path

### Month 4-6: Skill Development
**Focus:** Build Core Competencies
- Enroll in relevant courses (online/offline)
- Develop technical skills specific to ${careerName}
- Work on soft skills (communication, teamwork)
- Start building a portfolio/resume
- Join related clubs or communities

**Practice:**
- Dedicate 3-4 hours daily to skill practice
- Complete 2-3 small projects
- Participate in workshops/webinars
- Network with peers & mentors

**Milestone:** Basic proficiency in core skills

### Month 7-9: Advanced Learning
**Focus:** Specialization & Depth
- Choose your specialization within ${careerName}
- Take advanced courses & certifications
- Work on 1-2 significant projects
- Attend industry conferences/seminars
- Read case studies & research papers

**Resources:**
- Industry-specific certifications
- Advanced online courses
- Mentorship programs
- Professional associations

**Milestone:** Intermediate to advanced skill level

### Month 10-12: Application & Experience
**Focus:** Real-world Practice
- Apply for internships in ${careerName}
- Build complete portfolio showcasing your work
- Network actively (LinkedIn, Twitter, events)
- Prepare for entrance exams (if applicable)
- Start creating your personal brand

**Activities:**
- Update LinkedIn profile professionally
- Create portfolio website
- Contribute to open projects
- Volunteer in relevant organizations
- Prepare for interviews

**Milestone:** Job-ready with portfolio

## 📝 Entrance Exams & Admissions:
**Research the following for ${careerName}:**
- National level entrance exams
- State level exams
- College-specific admission tests
- Entrance exam syllabus & pattern
- Important dates & deadlines

**Preparation Tips:**
- Start exam prep 6 months before
- Take regular mock tests
- Join test series if needed
- Analyze previous year papers
- Focus on time management

## 🎓 Top Institutes to Target:
**Tier 1:**
- Research top 10 colleges for ${careerName} in India
- Check admission criteria & cutoffs
- Understand fee structure & scholarships
- Visit college websites & attend open houses

**Tier 2:**
- Identify 5-10 backup options
- Consider state universities & private colleges
- Compare placement records
- Talk to alumni if possible

## 💡 Skills to Develop:
**Technical Skills:**
- Core skills required for ${careerName}
  - Skill 1: [Research & list specific technical skills]
  - Skill 2: [Equipment/software knowledge]
  - Skill 3: [Industry tools & technologies]

**Soft Skills:**
- Communication (written & verbal)
- Problem-solving & critical thinking
- Time management & organization
- Leadership & teamwork
- Adaptability & continuous learning

## 📚 Recommended Learning Path:
**Online Platforms:**
- Coursera (University-level courses)
- Udemy (Practical skills)
- edX (MIT, Harvard courses)
- Khan Academy (Fundamentals)
- LinkedIn Learning (Professional skills)

**Books to Read:**
- Industry-specific bestsellers
- Biographies of successful people in ${careerName}
- Self-help & productivity books
- Technical manuals & guides

**YouTube Channels:**
- Search for top creators in ${careerName}
- Follow industry experts
- Watch tutorials & case studies

## 🚀 Daily Study Schedule:
**Weekdays (During School/College):**
- 6 AM - 7 AM: Reading & Theory
- 4 PM - 7 PM: Practical Skills (3 hours)
- 8 PM - 10 PM: Projects & Practice (2 hours)

**Weekends:**
- 8 AM - 12 PM: Deep Learning (4 hours)
- 2 PM - 6 PM: Project Work (4 hours)
- 7 PM - 9 PM: Networking & Research (2 hours)

**Total:** 20-25 hours/week

## 💼 Career Opportunities in ${careerName}:
**Job Roles:**
- Entry-level positions
- Mid-level career options
- Senior roles after experience
- Entrepreneurship opportunities

**Expected Salary Range:**
- Starting: Research average fresher salary
- After 3-5 years: Mid-level compensation
- After 10 years: Senior professional income

**Top Employers:**
- Research companies hiring for ${careerName}
- Government opportunities
- Private sector options
- Freelancing potential

## 🎯 Action Steps (Start Today):
1. **Week 1:** Research & create detailed career plan
2. **Week 2:** Identify and enroll in first course
3. **Week 3:** Set up learning environment & tools
4. **Week 4:** Start daily practice routine
5. **Month 2 onwards:** Follow monthly roadmap above

## ⚡ Success Tips:
- **Stay Curious:** Never stop learning
- **Build Network:** People = Opportunities
- **Document Journey:** Blog/vlog your progress
- **Seek Mentorship:** Find a guide in the field
- **Stay Updated:** Follow industry trends & news
- **Practice Daily:** Consistency beats intensity
- **Take Care:** Health = Wealth

## 📱 Useful Resources:
**Communities to Join:**
- Reddit communities for ${careerName}
- LinkedIn groups
- Discord servers
- Local meetups & events

**Stay Connected:**
- Follow industry leaders on Twitter/LinkedIn
- Subscribe to relevant newsletters
- Join professional associations
- Attend webinars & workshops

---

**Remember:** Every expert was once a beginner. Stay persistent, practice daily, and believe in your journey!

**Need specific guidance on any topic or month? Just ask!** 💬

---

*Note: This is a general roadmap. For more specific guidance tailored to ${careerName}, please provide more details about:*
- Your specific interests within this career
- Preferred location (India/abroad)
- Budget for education
- Timeline for career start

*I'll create a more personalized roadmap for you!* 🎯`;
}
