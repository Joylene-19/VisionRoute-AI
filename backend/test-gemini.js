import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log("Testing Gemini API Key...\n");
    console.log(
      "API Key (first 10 chars):",
      process.env.GEMINI_API_KEY?.substring(0, 10)
    );

    // Try to list available models
    const models = await genAI.listModels();

    console.log("\n✅ API Key is valid!");
    console.log("\nAvailable models:");
    for (const model of models) {
      console.log(`- ${model.name}`);
      console.log(
        `  Supported methods: ${model.supportedGenerationMethods?.join(", ")}`
      );
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("\nYour API key may be:");
    console.error("1. Invalid or expired");
    console.error("2. Not enabled for Gemini API");
    console.error("3. Restricted to certain models");
    console.error(
      "\nPlease check your API key at: https://makersuite.google.com/app/apikey"
    );
  }
}

listModels();
