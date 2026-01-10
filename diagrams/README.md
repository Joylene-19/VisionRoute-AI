# VisionRoute AI - PlantUML Diagrams

## 📊 How to View the Diagrams

### Option 1: Online PlantUML Viewer

1. Go to **http://www.plantuml.com/plantuml/uml/**
2. Copy the content from `.puml` files
3. Paste and click "Submit"

### Option 2: VS Code Extension

1. Install **"PlantUML"** extension in VS Code
2. Open any `.puml` file
3. Press `Alt+D` to preview

### Option 3: IntelliJ IDEA / PyCharm

1. Install **"PlantUML Integration"** plugin
2. Open `.puml` file
3. Right-click → "Show PlantUML Diagram"

---

## 📁 Diagram Files

### 1. **usecase-diagram.puml**

**Use Case Diagram** showing:

- **Actors**: Student, Admin, AI System, Email Service
- **Use Cases**: 28 different system functionalities
- **Relationships**: Include, Extend, and Association relationships

**Key Features:**

- Authentication & Profile Management
- Assessment Module (Start, Answer, Save, Resume, Submit)
- Results & AI Analysis
- Admin Functions
- Email Notifications

---

### 2. **er-diagram.puml**

**Entity-Relationship Diagram** showing:

- **Entities**: User, Assessment, Question, Result, Response, Option
- **Attributes**: All fields with data types
- **Relationships**: One-to-Many, One-to-One mappings
- **Keys**: Primary Keys (PK) and Foreign Keys (FK)

**Database Collections:**

- **Users**: Authentication, profile, history
- **Assessments**: Progress tracking, responses, scores
- **Questions**: Question bank (85 questions)
- **Results**: AI analysis, recommendations, PDF reports

---

## 🎨 Diagram Customization

### Change Colors

Add this at the top of any `.puml` file:

```plantuml
skinparam backgroundColor #FEFEFE
skinparam actor {
  BackgroundColor #3B82F6
  BorderColor #1E40AF
}
skinparam usecase {
  BackgroundColor #8B5CF6
  BorderColor #6D28D9
}
```

### Change Font

```plantuml
skinparam defaultFontName Arial
skinparam defaultFontSize 12
```

---

## 📤 Export as Images

### Using PlantUML CLI

```bash
# Install PlantUML
npm install -g node-plantuml

# Generate PNG
puml generate diagrams/usecase-diagram.puml -o diagrams/

# Generate SVG
puml generate diagrams/er-diagram.puml -o diagrams/ -t svg
```

### Using Online Service

1. Go to http://www.plantuml.com/plantuml/
2. Paste your code
3. Click "PNG" or "SVG" to download

---

## 📋 Diagram Descriptions for Report

### Use Case Diagram Description

```
The Use Case Diagram illustrates the interactions between different actors
(Student, Admin, AI System, Email Service) and the VisionRoute AI system.
It demonstrates 28 use cases organized into five main modules:

1. Authentication (Register, Login, OAuth, Password Reset)
2. Profile Management (View, Update, Change Password)
3. Assessment Module (Start, Answer, Save, Resume, Submit)
4. Results & Analysis (View Results, AI Recommendations, PDF Download)
5. Admin Functions (User Management, Analytics, Question Bank)

The diagram uses <<include>> and <<extend>> relationships to show
dependencies between use cases, such as assessment submission
automatically triggering AI analysis.
```

### ER Diagram Description

```
The Entity-Relationship Diagram represents the database schema for
VisionRoute AI, designed using MongoDB (NoSQL). The schema consists
of six main entities:

1. User: Stores authentication credentials, profile information, and
   assessment history. Supports both email/password and Google OAuth.

2. Assessment: Tracks student assessment progress, responses, and scores
   across 4 categories (Interest, Aptitude, Personality, Academic) with
   auto-save functionality.

3. Question: Contains the question bank of 85 questions with multiple
   types (MCQ, Rating Scale, Yes/No, Ranking) and weighted scoring.

4. Response: Embedded subdocument within Assessment storing user answers
   to each question with timestamps.

5. Option: Embedded subdocument within Question defining answer choices
   with associated scores.

6. Result: Stores AI-generated analysis, stream recommendations, RIASEC
   profile, career paths, and PDF report URLs.

Relationships include One-to-Many between User and Assessment,
Assessment and Response, Question and Response, and One-to-One between
Assessment and Result.
```

---

## 🖼️ Sample Output Preview

After generating, you'll get:

- **usecase-diagram.png** - Visual representation of system functionality
- **er-diagram.png** - Database schema visualization

Both diagrams follow UML standards and are suitable for academic submissions.

---

**Created for VisionRoute AI Project**  
Smart Stream Guidance Platform - December 2025
