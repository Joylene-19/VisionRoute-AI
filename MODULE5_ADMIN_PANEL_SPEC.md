# Module 5: Admin Panel - Complete Specification

## 🎯 **Overview**

Comprehensive admin dashboard for platform management and oversight.

---

## 🔐 **1. Separate Admin Authentication**

### **Admin Login Route**

- **URL**: `/admin/login` (separate from student login `/login`)
- **Features**:
  - Email/Password authentication only (no Google OAuth for admin)
  - Role verification (only users with `role: 'admin'` can access)
  - Separate admin dashboard redirect after login
  - Session management with admin-specific JWT tokens

### **Admin Routes Structure**

```
/admin/login          → Admin login page
/admin/dashboard      → Admin main dashboard
/admin/users          → User management
/admin/questions      → Question bank management
/admin/assessments    → View all assessments
/admin/reports        → User reports management
/admin/analytics      → System analytics
```

---

## 📊 **2. Admin Dashboard Features**

### **A. Question Bank Management**

**Priority Feature** ⭐

**Capabilities:**

1. **View All Questions** (85 total)

   - Filter by category (Interest, Aptitude, Personality, Academic)
   - Search questions by text
   - Sort by order number

2. **Edit Questions**

   - Modify question text
   - Update question type (MCQ, Rating Scale, Yes/No, Ranking)
   - Edit options and scoring weights
   - Change category/subcategory
   - Update help text

3. **AI Question Generation** (Using Gemini)

   - Generate questions for specific categories
   - AI suggests question text, options, and scoring
   - Admin reviews and approves before adding to question bank
   - AI analyzes existing questions to maintain consistency

4. **Question Status Management**
   - Activate/Deactivate questions
   - Mark questions as required/optional
   - Reorder questions (change order number)

**Backend API Endpoints:**

```javascript
GET    /api/admin/questions              // Get all questions
GET    /api/admin/questions/:id          // Get single question
POST   /api/admin/questions              // Create new question
PUT    /api/admin/questions/:id          // Update question
DELETE /api/admin/questions/:id          // Delete question
POST   /api/admin/questions/generate     // AI generate questions
PUT    /api/admin/questions/:id/toggle   // Activate/Deactivate
```

---

### **B. User Management**

**Capabilities:**

1. **View All Users**

   - List all registered students
   - Filter by: Registration date, Grade, Completion status
   - Search by name, email, school

2. **User Details**

   - View complete user profile
   - Assessment history
   - Login activity (last login, login count)
   - Email verification status

3. **User Actions**
   - Reset user password (send reset email)
   - Deactivate/Activate user account
   - Delete user account (with confirmation)
   - Export user data

**Backend API Endpoints:**

```javascript
GET    /api/admin/users                  // Get all users
GET    /api/admin/users/:id              // Get user details
PUT    /api/admin/users/:id              // Update user
DELETE /api/admin/users/:id              // Delete user
POST   /api/admin/users/:id/reset-password // Send reset email
PUT    /api/admin/users/:id/toggle       // Activate/Deactivate
```

---

### **C. Assessment & Report Management**

**Capabilities:**

1. **View All Assessments**

   - List all submitted assessments
   - Filter by: Status, Date, User, Completion percentage
   - Sort by submission date

2. **View Individual Reports**

   - Access any user's assessment results
   - View AI-generated recommendations
   - See detailed scores (RIASEC, Aptitude, Personality, Academic)
   - Check time spent and completion details

3. **Send PDF Reports to Users** ⭐

   - Generate PDF report for any assessment
   - Send report via email to user
   - Track email delivery status
   - Resend reports if needed
   - Bulk send reports to multiple users

4. **Report Analytics**
   - Most recommended streams
   - Average completion time
   - Question difficulty analysis
   - Drop-off points in assessment

**Backend API Endpoints:**

```javascript
GET    /api/admin/assessments            // Get all assessments
GET    /api/admin/assessments/:id        // Get assessment details
GET    /api/admin/reports/:id            // Get user report
POST   /api/admin/reports/:id/send       // Send PDF to user email
POST   /api/admin/reports/bulk-send      // Send multiple reports
GET    /api/admin/analytics               // System analytics
```

---

### **D. Email Notification System**

**Admin Email Actions:**

1. **Send Assessment Report**

   - Attach PDF report
   - Personalized email template
   - Track sent status

2. **Send Assessment Reminders**

   - To users who started but didn't complete
   - Customizable reminder message

3. **Bulk Notifications**
   - Announcements to all users
   - Targeted notifications (by grade, completion status)

**Email Templates:**

```
1. Assessment_Report_Template.html
   - Subject: "Your VisionRoute AI Assessment Results"
   - Attachment: PDF report
   - Personalized recommendations summary

2. Assessment_Reminder_Template.html
   - Subject: "Complete Your Stream Guidance Assessment"
   - Progress reminder
   - Call-to-action button

3. Admin_Announcement_Template.html
   - Subject: Custom
   - General announcements
```

---

### **E. System Analytics Dashboard**

**Metrics to Display:**

1. **User Statistics**

   - Total registered users
   - Active users (last 30 days)
   - New registrations (daily/weekly/monthly)

2. **Assessment Statistics**

   - Total assessments completed
   - Completion rate (%)
   - Average completion time
   - Assessments in progress

3. **Stream Recommendations Analysis**

   - Most recommended streams (Science, Commerce, Arts, Vocational)
   - Distribution chart/graph
   - Career path popularity

4. **Question Performance**

   - Most skipped questions
   - Average time per question
   - Questions with highest/lowest scores

5. **Engagement Metrics**
   - Login frequency
   - Average time on platform
   - Feature usage statistics

**Visualizations:**

- Line charts (user growth over time)
- Pie charts (stream distribution)
- Bar charts (assessments per grade)
- Heatmaps (user activity by day/hour)

---

## 🎨 **3. Admin UI/UX Design**

### **Admin Dashboard Layout**

```
┌─────────────────────────────────────────┐
│  VisionRoute AI - Admin Panel          │
├───────────┬─────────────────────────────┤
│           │                             │
│ Sidebar   │  Main Content Area          │
│ Menu      │                             │
│           │  - Dashboard Cards          │
│ Dashboard │  - Charts & Graphs          │
│ Users     │  - Data Tables              │
│ Questions │  - Action Buttons           │
│ Assess.   │                             │
│ Reports   │                             │
│ Analytics │                             │
│ Settings  │                             │
│ Logout    │                             │
│           │                             │
└───────────┴─────────────────────────────┘
```

### **Color Scheme**

- Admin theme: Dark sidebar with accent color
- Primary: #1E40AF (darker blue for admin)
- Accent: #F59E0B (amber for alerts/actions)
- Keep professional and distinct from student interface

---

## 🛠️ **4. Technical Implementation**

### **Backend Changes Required**

**New Files to Create:**

```
backend/src/
├── routes/
│   └── adminRoutes.js (already exists, needs expansion)
├── controllers/
│   ├── adminQuestionController.js
│   ├── adminUserController.js
│   ├── adminReportController.js
│   └── adminAnalyticsController.js
├── middleware/
│   └── adminAuth.js (admin role verification)
└── utils/
    ├── emailService.js (Nodemailer setup)
    └── pdfGenerator.js (jsPDF or Puppeteer)
```

### **Frontend Changes Required**

**New Files to Create:**

```
frontend/src/
├── pages/
│   └── admin/
│       ├── AdminLogin.jsx
│       ├── AdminDashboard.jsx
│       ├── UserManagement.jsx
│       ├── QuestionManagement.jsx
│       ├── AssessmentReports.jsx
│       └── Analytics.jsx
├── components/
│   └── admin/
│       ├── AdminSidebar.jsx
│       ├── AdminNavbar.jsx
│       ├── QuestionEditor.jsx
│       ├── UserTable.jsx
│       ├── ReportViewer.jsx
│       └── StatsCard.jsx
└── services/
    └── adminService.js
```

---

## 📧 **5. Email Integration (Nodemailer)**

### **Setup Required:**

```javascript
// backend/src/config/email.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // or SendGrid, Mailgun
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendAssessmentReport = async (userEmail, pdfBuffer) => {
  const mailOptions = {
    from: "VisionRoute AI <noreply@visionroute.ai>",
    to: userEmail,
    subject: "Your Stream Guidance Assessment Results",
    html: emailTemplate,
    attachments: [
      {
        filename: "VisionRoute_Report.pdf",
        content: pdfBuffer,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};
```

---

## 🔒 **6. Security Considerations**

1. **Admin Authentication**

   - Separate admin JWT secret
   - Shorter token expiration (1 day vs 7 days)
   - IP whitelisting option
   - Two-factor authentication (future enhancement)

2. **Role-Based Access Control**

   - Middleware to verify admin role on all admin routes
   - Prevent privilege escalation
   - Audit log for admin actions

3. **Data Protection**
   - Admin cannot see user passwords (hashed only)
   - Sensitive actions require confirmation
   - Rate limiting on admin endpoints

---

## 📝 **7. Implementation Priority**

**Phase 1: Admin Authentication & Dashboard** (Module 5a)

- Admin login route
- Admin middleware
- Basic dashboard layout

**Phase 2: Question Management** (Module 5b)

- View/Edit questions
- AI question generation
- Question bank CRUD

**Phase 3: User & Report Management** (Module 5c)

- User list and details
- View assessment reports
- Send PDF via email

**Phase 4: Analytics & Advanced Features** (Module 5d)

- System analytics dashboard
- Bulk operations
- Advanced reporting

---

## 🎯 **Success Metrics**

After implementing Module 5, admin should be able to:

- ✅ Login separately from students
- ✅ View and modify all 85 questions
- ✅ Generate new questions using AI
- ✅ View all user assessment reports
- ✅ Send PDF reports to users via email
- ✅ Monitor system analytics and user engagement
- ✅ Manage user accounts effectively

---

**Status:** 📋 **PLANNED - To be implemented as Module 5**

**Dependencies:**

- Module 1: User Authentication ✅ Complete
- Module 2: Smart Assessment Module (In Progress)
- Module 3: AI Analysis & Recommendations
- Module 4: Results & Dashboard
- **→ Module 5: Admin Panel** ← YOU ARE HERE IN PLANNING

---

**Notes:**

- User suggested implementing this as Module 5
- Can be built after core student features are complete
- Email service (Nodemailer) needs to be added to dependencies
- PDF generation library (jsPDF or Puppeteer) required
- Consider using DataTables or AG Grid for admin tables
