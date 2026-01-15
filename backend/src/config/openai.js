import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

/**
 * Initialize Groq AI (Free & Fast!)
 */
let groq = null;

const initializeGroq = () => {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.warn("⚠️  GROQ_API_KEY not found in environment variables");
      return null;
    }

    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    console.log("✅ Groq AI initialized (llama-3.3-70b-versatile) - FREE!");
    return groq;
  } catch (error) {
    console.error("❌ Groq initialization error:", error.message);
    console.warn("⚠️  Continuing without Groq...");
    return null;
  }
};

// Initialize Groq
const groqClient = initializeGroq();

export { groqClient };
