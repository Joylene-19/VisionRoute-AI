import mongoose from "mongoose";
import Assessment from "./src/models/Assessment.js";
import User from "./src/models/User.js";
import dotenv from "dotenv";

dotenv.config();

const viewAssessment = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get one completed assessment
    const assessment = await Assessment.findOne({ status: "completed" })
      .populate("user", "name email")
      .lean();

    if (!assessment) {
      console.log("❌ No completed assessments found");
      return;
    }

    console.log("\n📊 Assessment Data:");
    console.log("ID:", assessment._id);
    console.log("User:", assessment.user);
    console.log("Status:", assessment.status);
    console.log("Total Questions:", assessment.totalQuestions);
    console.log("Answered Questions:", assessment.questionsAnswered);
    console.log("\n📈 Scores:");
    console.log(JSON.stringify(assessment.scores, null, 2));
    console.log("\n🧠 AI Analysis:");
    console.log(assessment.aiAnalysis ? "Present" : "Not generated");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

viewAssessment();
