import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

/**
 * Initialize Google Gemini AI
 */
let genAI = null;
let model = null;

const initializeGemini = () => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("  GEMINI_API_KEY not found in environment variables");
      return null;
    }

    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Use Gemini 1.5 Flash (free tier model)
    model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
      },
    });

    console.log("✅ Google Gemini AI initialized (gemini-1.5-flash)");
    return model;
  } catch (error) {
    console.error(" Gemini initialization error:", error.message);
    console.warn("  Continuing without Gemini AI...");
    return null;
  }
};

// Initialize Gemini
const geminiModel = initializeGemini();

/**
 * Sleep helper for retry logic
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate AI content with error handling and retry logic
 * @param {string} prompt - The prompt to send to AI
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<string>} - AI generated response
 */
export const generateAIContent = async (prompt, maxRetries = 3) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (!geminiModel) {
        throw new Error("Gemini AI is not initialized");
      }

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text;
    } catch (error) {
      lastError = error;

      // Check if it's a rate limit error
      if (error.status === 429 && attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff, max 10s
        console.log(
          `⏳ Rate limit hit, retrying in ${waitTime / 1000}s... (Attempt ${
            attempt + 1
          }/${maxRetries})`
        );
        await sleep(waitTime);
        continue;
      }

      console.error(" Gemini AI generation error:", error.message);
      break;
    }
  }

  throw lastError;
};

/**
 * Generate AI content with JSON response
 * @param {string} prompt - The prompt to send to AI
 * @returns {Promise<Object>} - Parsed JSON response
 */
export const generateAIJSON = async (prompt) => {
  try {
    const text = await generateAIContent(prompt);

    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
    const jsonString = jsonMatch ? jsonMatch[1] : text;

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini AI JSON parsing error:", error.message);
    throw error;
  }
};

export { genAI, geminiModel };
export default geminiModel;
