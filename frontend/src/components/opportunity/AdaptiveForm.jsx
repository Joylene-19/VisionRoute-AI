import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getCommonFields,
  getFieldsForLevel,
  validateFormData,
} from "../../utils/opportunityFormFields";
import { FileEdit, CheckCircle2 } from "lucide-react";

const AdaptiveForm = ({ educationLevel, onSubmit, onBack, initialData }) => {
  const [formData, setFormData] = useState({
    educationStatus: initialData?.educationStatus || "",
    familyIncome: initialData?.familyIncome || "",
    careerInterest: initialData?.careerInterest || "",
    academicData: initialData?.academicData || {},
  });

  const [errors, setErrors] = useState({});
  const [showOther, setShowOther] = useState({});

  // Get common fields based on education level
  const commonFields = getCommonFields(educationLevel);

  // Get dynamic fields based on education level AND status
  const [dynamicFields, setDynamicFields] = useState(
    getFieldsForLevel(educationLevel, formData.educationStatus),
  );

  // Update dynamic fields when education status changes
  useEffect(() => {
    const newDynamicFields = getFieldsForLevel(
      educationLevel,
      formData.educationStatus,
    );
    setDynamicFields(newDynamicFields);

    // Clear academic data when status changes to avoid invalid data
    if (formData.educationStatus) {
      setFormData((prev) => ({
        ...prev,
        academicData: {},
      }));
      setErrors({});
    }
  }, [educationLevel, formData.educationStatus]);

  const handleCommonFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });
    // Clear error when user types
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: undefined });
    }
  };

  const handleAcademicDataChange = (fieldName, value) => {
    setFormData({
      ...formData,
      academicData: {
        ...formData.academicData,
        [fieldName]: value,
      },
    });
    // Clear error
    const errorKey = `academicData.${fieldName}`;
    if (errors[errorKey]) {
      setErrors({ ...errors, [errorKey]: undefined });
    }

    // Handle "Others" option
    if (value === "Others") {
      setShowOther({ ...showOther, [fieldName]: true });
    } else if (showOther[fieldName]) {
      setShowOther({ ...showOther, [fieldName]: false });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate
    const validationErrors = validateFormData(educationLevel, formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstErrorElement = document.querySelector(".error-message");
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    // Prepare submission data
    const submissionData = {
      educationLevel,
      familyIncome: formData.familyIncome,
      careerInterest: formData.careerInterest,
      academicData: formData.academicData,
    };

    // Only include educationStatus for Diploma/Bachelor/Master
    if (!["10th Pass", "12th Pass"].includes(educationLevel)) {
      submissionData.educationStatus = formData.educationStatus;
    }

    onSubmit(submissionData);
  };

  const renderField = (fieldName, field, isAcademic = false) => {
    const value = isAcademic
      ? formData.academicData[fieldName] || ""
      : formData[fieldName] || "";
    const errorKey = isAcademic ? `academicData.${fieldName}` : fieldName;
    const hasError = errors[errorKey];

    return (
      <div key={fieldName} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {field.type === "select" && (
          <select
            value={value}
            onChange={(e) =>
              isAcademic
                ? handleAcademicDataChange(fieldName, e.target.value)
                : handleCommonFieldChange(fieldName, e.target.value)
            }
            className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${
              hasError
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-white`}
          >
            <option value="">{field.placeholder || "Select..."}</option>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}

        {field.type === "number" && (
          <input
            type="number"
            value={value}
            onChange={(e) =>
              isAcademic
                ? handleAcademicDataChange(fieldName, e.target.value)
                : handleCommonFieldChange(fieldName, e.target.value)
            }
            min={field.min}
            max={field.max}
            step={field.step || 1}
            placeholder={field.placeholder}
            className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${
              hasError
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-white`}
          />
        )}

        {field.type === "text" && (
          <input
            type="text"
            value={value}
            onChange={(e) =>
              isAcademic
                ? handleAcademicDataChange(fieldName, e.target.value)
                : handleCommonFieldChange(fieldName, e.target.value)
            }
            placeholder={field.placeholder}
            className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${
              hasError
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-white`}
          />
        )}

        {field.type === "textarea" && (
          <textarea
            value={value}
            onChange={(e) =>
              isAcademic
                ? handleAcademicDataChange(fieldName, e.target.value)
                : handleCommonFieldChange(fieldName, e.target.value)
            }
            placeholder={field.placeholder}
            rows="4"
            className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${
              hasError
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-white resize-none`}
          />
        )}

        {/* "Others" text input */}
        {showOther[fieldName] && (
          <input
            type="text"
            placeholder="Please specify"
            className="mt-2 w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-white"
            onChange={(e) =>
              isAcademic
                ? handleAcademicDataChange(`${fieldName}Other`, e.target.value)
                : handleCommonFieldChange(`${fieldName}Other`, e.target.value)
            }
          />
        )}

        {hasError && (
          <p className="error-message mt-1 text-sm text-red-500">
            {errors[errorKey]}
          </p>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Academic Details
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Education Level:{" "}
          <span className="font-semibold">{educationLevel}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Common Fields Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
              1
            </span>
            General Information
          </h3>
          {Object.keys(commonFields).map((fieldName) =>
            renderField(fieldName, commonFields[fieldName], false),
          )}
        </div>

        {/* Dynamic Fields Section */}
        {Object.keys(dynamicFields).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              Academic Performance
            </h3>

            {/* Info message for status-aware levels */}
            {!["10th Pass", "12th Pass"].includes(educationLevel) &&
              formData.educationStatus && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <div className="flex items-start gap-2">
                    {formData.educationStatus === "Currently Studying" ? (
                      <FileEdit
                        className="w-4 h-4 text-blue-700 dark:text-blue-300 flex-shrink-0 mt-0.5"
                        strokeWidth={2}
                      />
                    ) : (
                      <CheckCircle2
                        className="w-4 h-4 text-blue-700 dark:text-blue-300 flex-shrink-0 mt-0.5"
                        strokeWidth={2}
                      />
                    )}
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {formData.educationStatus === "Currently Studying"
                        ? "Please enter details based on semesters/years you have completed so far."
                        : "Please enter your final academic performance details."}
                    </p>
                  </div>
                </div>
              )}

            {Object.keys(dynamicFields).map((fieldName) =>
              renderField(fieldName, dynamicFields[fieldName], true),
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            Generate Analysis →
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AdaptiveForm;
