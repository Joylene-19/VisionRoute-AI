// Education level options
export const EDUCATION_LEVELS = [
  { value: "10th Pass", label: "10th Pass", icon: "BookOpen" },
  { value: "12th Pass", label: "12th Pass", icon: "GraduationCap" },
  { value: "Diploma", label: "Diploma", icon: "ScrollText" },
  { value: "Bachelor Degree", label: "Bachelor Degree", icon: "Target" },
  { value: "Master Degree", label: "Master Degree", icon: "Trophy" },
];

// Common fields - Basic info needed for all
export const BASE_COMMON_FIELDS = {
  familyIncome: {
    label: "Family Annual Income",
    type: "select",
    options: ["Below 2 Lakhs", "2-5 Lakhs", "5-8 Lakhs", "Above 8 Lakhs"],
    required: true,
    placeholder: "Select income range",
  },
  careerInterest: {
    label: "Primary Career Interest",
    type: "select",
    options: [
      "Technical",
      "Research",
      "Management",
      "Creative",
      "Government Jobs",
      "Business",
    ],
    required: true,
    placeholder: "Select your interest",
  },
};

// Get common fields based on education level
export const getCommonFields = (educationLevel) => {
  const isCompleted = ["10th Pass", "12th Pass"].includes(educationLevel);

  if (isCompleted) {
    // For 10th/12th Pass - they've already completed, no status needed
    return BASE_COMMON_FIELDS;
  } else {
    // For Diploma/Bachelor/Master - they might be studying or completed
    return {
      educationStatus: {
        label: "Current Education Status",
        type: "select",
        options: ["Currently Studying", "Completed"],
        required: true,
        placeholder: "Select status",
      },
      ...BASE_COMMON_FIELDS,
    };
  }
};

// Dynamic fields based on education level and status
export const DYNAMIC_FIELDS = {
  "10th Pass": {
    percentage: {
      label: "10th Percentage",
      type: "number",
      min: 0,
      max: 100,
      step: 0.01,
      required: true,
      placeholder: "Enter final percentage",
    },
    favouriteSubject: {
      label: "Favourite Subject",
      type: "select",
      options: [
        "Mathematics",
        "Science",
        "English",
        "Hindi",
        "Social Science",
        "Computer",
        "Others",
      ],
      required: true,
      placeholder: "Select subject",
    },
    futureStream: {
      label: "Interested Stream for 11th/12th",
      type: "select",
      options: ["Science (PCM)", "Science (PCB)", "Commerce", "Arts"],
      required: true,
      placeholder: "Select stream",
    },
  },

  "12th Pass": {
    stream: {
      label: "Stream/Group",
      type: "select",
      options: ["Science (PCM)", "Science (PCB)", "Commerce", "Arts"],
      required: true,
      placeholder: "Select your stream",
    },
    percentage: {
      label: "12th Percentage",
      type: "number",
      min: 0,
      max: 100,
      step: 0.01,
      required: true,
      placeholder: "Enter final percentage",
    },
    favouriteSubject: {
      label: "Favourite Subject",
      type: "select",
      options: [
        "Physics",
        "Chemistry",
        "Mathematics",
        "Biology",
        "Accounts",
        "Economics",
        "Computer Science",
        "Business Studies",
        "English",
        "Others",
      ],
      required: true,
      placeholder: "Select subject",
    },
    highestMarksSubject: {
      label: "Highest Marks Subject",
      type: "text",
      required: true,
      placeholder: "Subject where you scored best",
    },
  },

  Diploma: {
    // Fields shown when studying
    studying: {
      branch: {
        label: "Diploma Branch/Specialization",
        type: "select",
        options: [
          "Computer Science",
          "Mechanical Engineering",
          "Civil Engineering",
          "Electrical Engineering",
          "Electronics",
          "Automobile",
          "Others",
        ],
        required: true,
        placeholder: "Select branch",
      },
      semestersCompleted: {
        label: "Semesters Completed",
        type: "select",
        options: ["1", "2", "3", "4", "5"],
        required: true,
        placeholder: "How many semesters completed?",
      },
      currentCGPA: {
        label: "Current CGPA/Percentage",
        type: "number",
        min: 0,
        max: 10,
        step: 0.01,
        required: true,
        placeholder: "Enter current CGPA (out of 10) or %",
      },
      strongestSubject: {
        label: "Strongest Subject/Area",
        type: "text",
        required: true,
        placeholder: "Your best performing subject",
      },
    },
    // Fields shown when completed
    completed: {
      branch: {
        label: "Diploma Branch/Specialization",
        type: "select",
        options: [
          "Computer Science",
          "Mechanical Engineering",
          "Civil Engineering",
          "Electrical Engineering",
          "Electronics",
          "Automobile",
          "Others",
        ],
        required: true,
        placeholder: "Select branch",
      },
      finalCGPA: {
        label: "Final CGPA/Percentage",
        type: "number",
        min: 0,
        max: 10,
        step: 0.01,
        required: true,
        placeholder: "Enter final CGPA (out of 10) or %",
      },
      passingYear: {
        label: "Year of Completion",
        type: "select",
        options: ["2026", "2025", "2024", "2023", "2022", "2021", "Earlier"],
        required: true,
        placeholder: "Select year",
      },
      strongestSubject: {
        label: "Strongest Subject/Area",
        type: "text",
        required: true,
        placeholder: "Your best performing subject",
      },
    },
  },

  "Bachelor Degree": {
    // Fields shown when studying
    studying: {
      degreeName: {
        label: "Degree Name",
        type: "select",
        options: [
          "BSc IT",
          "BSc CS",
          "BSc (General)",
          "B.Com",
          "BA",
          "BBA",
          "BCA",
          "B.Tech",
          "BE",
          "Others",
        ],
        required: true,
        placeholder: "Select degree",
      },
      specialization: {
        label: "Specialization/Major",
        type: "text",
        required: false,
        placeholder: "e.g., Computer Science, Marketing",
      },
      semestersCompleted: {
        label: "Semesters Completed",
        type: "select",
        options: ["1", "2", "3", "4", "5", "6", "7"],
        required: true,
        placeholder: "How many semesters completed?",
      },
      currentCGPA: {
        label: "Current CGPA",
        type: "number",
        min: 0,
        max: 10,
        step: 0.01,
        required: true,
        placeholder: "Enter CGPA so far (out of 10)",
      },
      strongestSubject: {
        label: "Strongest Subject/Area",
        type: "text",
        required: true,
        placeholder: "Subject where you excel",
      },
    },
    // Fields shown when completed
    completed: {
      degreeName: {
        label: "Degree Name",
        type: "select",
        options: [
          "BSc IT",
          "BSc CS",
          "BSc (General)",
          "B.Com",
          "BA",
          "BBA",
          "BCA",
          "B.Tech",
          "BE",
          "Others",
        ],
        required: true,
        placeholder: "Select degree",
      },
      specialization: {
        label: "Specialization/Major",
        type: "text",
        required: false,
        placeholder: "e.g., Computer Science, Marketing",
      },
      finalCGPA: {
        label: "Final CGPA",
        type: "number",
        min: 0,
        max: 10,
        step: 0.01,
        required: true,
        placeholder: "Enter final CGPA (out of 10)",
      },
      passingYear: {
        label: "Year of Completion",
        type: "select",
        options: ["2026", "2025", "2024", "2023", "2022", "2021", "Earlier"],
        required: true,
        placeholder: "Select year",
      },
      strongestSubject: {
        label: "Strongest Subject/Area",
        type: "text",
        required: true,
        placeholder: "Subject where you excel",
      },
    },
  },

  "Master Degree": {
    // Fields shown when studying
    studying: {
      degreeName: {
        label: "Master's Program",
        type: "select",
        options: ["MSc", "MA", "M.Com", "MBA", "MCA", "MTech", "ME", "Others"],
        required: true,
        placeholder: "Select program",
      },
      specialization: {
        label: "Specialization",
        type: "text",
        required: true,
        placeholder: "e.g., Data Science, Finance, AI",
      },
      semestersCompleted: {
        label: "Semesters Completed",
        type: "select",
        options: ["1", "2", "3"],
        required: true,
        placeholder: "How many semesters completed?",
      },
      currentCGPA: {
        label: "Current CGPA",
        type: "number",
        min: 0,
        max: 10,
        step: 0.01,
        required: true,
        placeholder: "Enter CGPA so far (out of 10)",
      },
      researchInterest: {
        label: "Research Interest (if any)",
        type: "textarea",
        required: false,
        placeholder: "Describe your research interests or thesis topic",
      },
    },
    // Fields shown when completed
    completed: {
      degreeName: {
        label: "Master's Program",
        type: "select",
        options: ["MSc", "MA", "M.Com", "MBA", "MCA", "MTech", "ME", "Others"],
        required: true,
        placeholder: "Select program",
      },
      specialization: {
        label: "Specialization",
        type: "text",
        required: true,
        placeholder: "e.g., Data Science, Finance, AI",
      },
      finalCGPA: {
        label: "Final CGPA",
        type: "number",
        min: 0,
        max: 10,
        step: 0.01,
        required: true,
        placeholder: "Enter final CGPA (out of 10)",
      },
      passingYear: {
        label: "Year of Completion",
        type: "select",
        options: ["2026", "2025", "2024", "2023", "2022", "2021", "Earlier"],
        required: true,
        placeholder: "Select year",
      },
      researchInterest: {
        label: "Research Interest/Thesis Topic",
        type: "textarea",
        required: false,
        placeholder: "Describe your research work or thesis",
      },
    },
  },
};

// Get fields for specific education level and status
export const getFieldsForLevel = (educationLevel, educationStatus = null) => {
  const levelFields = DYNAMIC_FIELDS[educationLevel];
  if (!levelFields) return {};

  // For 10th/12th Pass - no status differentiation
  if (["10th Pass", "12th Pass"].includes(educationLevel)) {
    return levelFields;
  }

  // For Diploma/Bachelor/Master - return fields based on status
  if (educationStatus === "Currently Studying") {
    return levelFields.studying || {};
  } else if (educationStatus === "Completed") {
    return levelFields.completed || {};
  }

  // Default to studying fields if status not provided
  return levelFields.studying || levelFields;
};

// Validate form data
export const validateFormData = (educationLevel, formData) => {
  const errors = {};

  // Get common fields for this education level
  const commonFields = getCommonFields(educationLevel);

  // Validate common fields
  Object.keys(commonFields).forEach((fieldName) => {
    const field = commonFields[fieldName];
    if (field.required && !formData[fieldName]) {
      errors[fieldName] = `${field.label} is required`;
    }
  });

  // Get dynamic fields based on education level and status
  const dynamicFields = getFieldsForLevel(
    educationLevel,
    formData.educationStatus,
  );

  Object.keys(dynamicFields).forEach((fieldName) => {
    const field = dynamicFields[fieldName];
    const value = formData.academicData?.[fieldName];

    if (field.required && !value) {
      errors[`academicData.${fieldName}`] = `${field.label} is required`;
    }

    // Validate number ranges
    if (field.type === "number" && value) {
      const numValue = parseFloat(value);
      if (field.min !== undefined && numValue < field.min) {
        errors[`academicData.${fieldName}`] = `Minimum value is ${field.min}`;
      }
      if (field.max !== undefined && numValue > field.max) {
        errors[`academicData.${fieldName}`] = `Maximum value is ${field.max}`;
      }
    }
  });

  return errors;
};
