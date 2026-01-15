import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Email Configuration with Nodemailer
 * Using Gmail SMTP (you can change to any email service)
 */

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, // App password, not your regular password
  },
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email configuration error:", error.message);
  } else {
    console.log("✅ Email server ready to send messages");
  }
});

/**
 * Send email function
 */
export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const mailOptions = {
      from: `"VisionRoute AI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("📧 Email sending error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Email Templates
 */
export const emailTemplates = {
  /**
   * Welcome Email Template
   */
  welcome: (name, dashboardUrl) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to VisionRoute AI</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to VisionRoute AI! 🎓</h1>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Hi <strong>${name}</strong>,
                  </p>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Welcome aboard! We're thrilled to have you join VisionRoute AI. Your journey to discovering the perfect career path starts here! 🚀
                  </p>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    Here's what you can do next:
                  </p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                    <tr>
                      <td style="padding: 10px 0;">
                        <span style="color: #667eea; font-size: 20px; margin-right: 10px;">✅</span>
                        <span style="color: #333; font-size: 15px;">Complete your profile</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0;">
                        <span style="color: #667eea; font-size: 20px; margin-right: 10px;">✅</span>
                        <span style="color: #333; font-size: 15px;">Take the Smart Career Assessment</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0;">
                        <span style="color: #667eea; font-size: 20px; margin-right: 10px;">✅</span>
                        <span style="color: #333; font-size: 15px;">Get personalized career recommendations</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0;">
                        <span style="color: #667eea; font-size: 20px; margin-right: 10px;">✅</span>
                        <span style="color: #333; font-size: 15px;">Chat with our AI Career Counselor</span>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                          Get Started Now
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                    If you have any questions, feel free to reply to this email. We're here to help!
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px;">
                  <p style="color: #666; font-size: 12px; margin: 0;">
                    © 2026 VisionRoute AI. All rights reserved.<br>
                    Helping students discover their ideal career path.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,

  /**
   * Assessment Completion Email Template
   */
  assessmentComplete: (name, resultsUrl) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Assessment Results</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Your Results are Ready! 📊</h1>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Congratulations, <strong>${name}</strong>! 🎉
                  </p>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    You've successfully completed your VisionRoute AI Career Assessment. Great job!
                  </p>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    Your personalized career report is now available and attached to this email as a PDF. This comprehensive report includes:
                  </p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0; background-color: #f8f9fa; border-radius: 6px; padding: 20px;">
                    <tr>
                      <td style="padding: 10px 0;">
                        <span style="color: #11998e; font-size: 20px; margin-right: 10px;">🎯</span>
                        <span style="color: #333; font-size: 15px;"><strong>Your RIASEC Personality Profile</strong></span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0;">
                        <span style="color: #11998e; font-size: 20px; margin-right: 10px;">💪</span>
                        <span style="color: #333; font-size: 15px;"><strong>Aptitude Scores & Strengths</strong></span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0;">
                        <span style="color: #11998e; font-size: 20px; margin-right: 10px;">🚀</span>
                        <span style="color: #333; font-size: 15px;"><strong>Top 10 Career Matches</strong></span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0;">
                        <span style="color: #11998e; font-size: 20px; margin-right: 10px;">📚</span>
                        <span style="color: #333; font-size: 15px;"><strong>Recommended Career Paths</strong></span>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${resultsUrl}" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                          View Results Online
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                    <strong>What's Next?</strong>
                  </p>
                  
                  <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 10px 0 0 0;">
                    • Chat with our AI Career Counselor for personalized guidance<br>
                    • Explore detailed career information for your matches<br>
                    • Share your results with parents or mentors<br>
                    • Start planning your career roadmap
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px;">
                  <p style="color: #666; font-size: 12px; margin: 0;">
                    © 2026 VisionRoute AI. All rights reserved.<br>
                    Your career journey, powered by AI.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,

  /**
   * Assessment Reminder Email Template
   */
  assessmentReminder: (name, resumeUrl, progress) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Complete Your Assessment</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Complete Your Assessment 📝</h1>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Hi <strong>${name}</strong>,
                  </p>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    You're ${progress}% through your career assessment! Just a few more questions and you'll unlock your personalized career roadmap. 🚀
                  </p>
                  
                  <!-- Progress Bar -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0 30px 0;">
                    <tr>
                      <td style="background-color: #e0e0e0; border-radius: 10px; height: 20px; overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); width: ${progress}%; height: 20px;"></div>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: center; padding-top: 10px;">
                        <span style="color: #666; font-size: 14px;">${progress}% Complete</span>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    Don't miss out on discovering careers that match your unique personality and skills!
                  </p>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${resumeUrl}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                          Continue Assessment
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                    It only takes 5 more minutes!
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px;">
                  <p style="color: #666; font-size: 12px; margin: 0;">
                    © 2026 VisionRoute AI. All rights reserved.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,
};

export default transporter;
