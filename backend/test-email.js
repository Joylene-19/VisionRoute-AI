import { sendEmail, emailTemplates } from "./src/config/email.js";
import dotenv from "dotenv";

dotenv.config();

async function testEmail() {
  try {
    console.log("🧪 Testing email system...");
    console.log(`📧 From: ${process.env.EMAIL_USER}`);
    console.log(`📧 To: joylene.pinto.23bsd026@gmail.com`);

    const htmlContent = emailTemplates.assessmentComplete(
      "Test User",
      "http://localhost:5173/results"
    );

    const result = await sendEmail({
      to: "joylene.pinto.23bsd026@gmail.com",
      subject: "🧪 VisionRoute AI - Test Email",
      html: htmlContent,
    });

    console.log("✅ Email sent successfully!");
    console.log(`📬 Message ID: ${result.messageId}`);
  } catch (error) {
    console.error("❌ Email test failed:", error);
  }
}

testEmail();
