import { sendEmail, emailTemplates } from "../config/email.js";

/**
 * Email Service - High-level email sending functions
 */

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * Send welcome email to new users
 */
export const sendWelcomeEmail = async (user) => {
  try {
    const dashboardUrl = `${FRONTEND_URL}/dashboard`;

    const result = await sendEmail({
      to: user.email,
      subject: "Welcome to VisionRoute AI! 🎓",
      html: emailTemplates.welcome(
        user.fullName || user.displayName,
        dashboardUrl
      ),
    });

    if (result.success) {
      console.log(`✅ Welcome email sent to ${user.email}`);
    }

    return result;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send assessment completion email with PDF attachment
 */
export const sendAssessmentCompleteEmail = async (user, pdfBuffer) => {
  try {
    const resultsUrl = `${FRONTEND_URL}/results`;

    const attachments = [];
    if (pdfBuffer) {
      attachments.push({
        filename: `VisionRoute_Report_${user.fullName || "User"}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      });
    }

    const result = await sendEmail({
      to: user.email,
      subject: "Your VisionRoute Assessment Results are Ready! 📊",
      html: emailTemplates.assessmentComplete(
        user.fullName || user.displayName,
        resultsUrl
      ),
      attachments,
    });

    if (result.success) {
      console.log(`✅ Assessment completion email sent to ${user.email}`);
    }

    return result;
  } catch (error) {
    console.error("Error sending assessment completion email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send assessment reminder email for incomplete assessments
 */
export const sendAssessmentReminderEmail = async (
  user,
  assessmentId,
  progress = 50
) => {
  try {
    const resumeUrl = `${FRONTEND_URL}/assessment?resume=${assessmentId}`;

    const result = await sendEmail({
      to: user.email,
      subject: "Complete Your Career Assessment 📝",
      html: emailTemplates.assessmentReminder(
        user.fullName || user.displayName,
        resumeUrl,
        Math.round(progress)
      ),
    });

    if (result.success) {
      console.log(`✅ Assessment reminder sent to ${user.email}`);
    }

    return result;
  } catch (error) {
    console.error("Error sending assessment reminder:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send custom notification email
 */
export const sendNotificationEmail = async (user, subject, message) => {
  try {
    const simpleTemplate = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px;">
          <h2 style="color: #333;">${subject}</h2>
          <p style="color: #666; line-height: 1.6;">${message}</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">© 2026 VisionRoute AI. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail({
      to: user.email,
      subject,
      html: simpleTemplate,
    });

    return result;
  } catch (error) {
    console.error("Error sending notification email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Batch send emails to multiple users
 */
export const sendBulkEmails = async (users, subject, getMessage) => {
  const results = [];

  for (const user of users) {
    try {
      const message =
        typeof getMessage === "function" ? getMessage(user) : getMessage;
      const result = await sendNotificationEmail(user, subject, message);
      results.push({ user: user.email, ...result });

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      results.push({ user: user.email, success: false, error: error.message });
    }
  }

  return results;
};
