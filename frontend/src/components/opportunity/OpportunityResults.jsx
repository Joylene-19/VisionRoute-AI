import { motion } from "framer-motion";
import { useState } from "react";
import {
  AcademicCapIcon,
  BanknotesIcon,
  BriefcaseIcon,
  LightBulbIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const OpportunityResults = ({ analysis, onRegenerate, onStartNew }) => {
  const [expandedSections, setExpandedSections] = useState({
    scholarships: true,
    higherEducation: true,
    careerPaths: true,
    skillDevelopment: true,
  });

  const [regenerating, setRegenerating] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const getConfidenceBadge = (score) => {
    if (score >= 80) {
      return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
    } else if (score >= 60) {
      return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
    } else {
      return "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300";
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-blue-600 dark:text-blue-400";
    if (percentage >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    await onRegenerate(analysis._id);
    setRegenerating(false);
  };

  const renderMatchBar = (percentage) => (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${
          percentage >= 80
            ? "bg-green-500"
            : percentage >= 60
              ? "bg-blue-500"
              : percentage >= 40
                ? "bg-yellow-500"
                : "bg-gray-400"
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <LightBulbIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Opportunity Analysis Results
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Generated on {new Date(analysis.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div
            className={`px-4 py-2 rounded-full font-semibold ${getConfidenceBadge(analysis.confidenceScore)}`}
          >
            {analysis.confidenceScore}% Confidence
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
          >
            <ArrowPathIcon
              className={`h-5 w-5 ${regenerating ? "animate-spin" : ""}`}
            />
            {regenerating ? "Regenerating..." : "Regenerate Analysis"}
          </button>
          <button
            onClick={onStartNew}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          >
            Start New Analysis
          </button>
        </div>
      </motion.div>

      {/* Scholarships Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <button
          onClick={() => toggleSection("scholarships")}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-xl hover:from-blue-600 hover:to-cyan-600 transition-all"
        >
          <div className="flex items-center gap-3">
            <BanknotesIcon className="h-6 w-6" />
            <h2 className="text-xl font-bold">
              Scholarship Opportunities (
              {analysis.recommendations?.scholarships?.length || 0})
            </h2>
          </div>
          <svg
            className={`w-6 h-6 transition-transform ${expandedSections.scholarships ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {expandedSections.scholarships && (
          <div className="border-2 border-gray-200 dark:border-gray-700 border-t-0 rounded-b-xl p-4 bg-white dark:bg-gray-800">
            <div className="grid gap-4">
              {analysis.recommendations?.scholarships?.map(
                (scholarship, index) => (
                  <div
                    key={index}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                            {scholarship.type}
                          </span>
                          <span
                            className={`font-semibold ${getMatchColor(scholarship.matchPercentage)}`}
                          >
                            {scholarship.matchPercentage}% Match
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {scholarship.name}
                        </h3>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      <strong>Eligibility:</strong> {scholarship.eligibility}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      <strong>Estimated Amount:</strong>{" "}
                      {scholarship.estimatedAmount}
                    </p>
                    <div className="mb-2">
                      {renderMatchBar(scholarship.matchPercentage)}
                    </div>
                    {scholarship.applicationLink && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        <strong>Apply:</strong> {scholarship.applicationLink}
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Higher Education Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <button
          onClick={() => toggleSection("higherEducation")}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-xl hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          <div className="flex items-center gap-3">
            <AcademicCapIcon className="h-6 w-6" />
            <h2 className="text-xl font-bold">
              Higher Education Programs (
              {analysis.recommendations?.higherEducation?.length || 0})
            </h2>
          </div>
          <svg
            className={`w-6 h-6 transition-transform ${expandedSections.higherEducation ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {expandedSections.higherEducation && (
          <div className="border-2 border-gray-200 dark:border-gray-700 border-t-0 rounded-b-xl p-4 bg-white dark:bg-gray-800">
            <div className="grid gap-4">
              {analysis.recommendations?.higherEducation?.map(
                (program, index) => (
                  <div
                    key={index}
                    className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {program.program}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Duration: {program.duration}
                        </p>
                      </div>
                      <span
                        className={`font-semibold text-lg ${getMatchColor(program.matchPercentage)}`}
                      >
                        {program.matchPercentage}%
                      </span>
                    </div>
                    <div className="mb-3">
                      {renderMatchBar(program.matchPercentage)}
                    </div>
                    <div className="mb-2">
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        Top Colleges:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {program.topColleges?.map((college, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                          >
                            {college}
                          </span>
                        ))}
                      </div>
                    </div>
                    {program.eligibility && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                        <strong>Eligibility:</strong> {program.eligibility}
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Career Paths Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <button
          onClick={() => toggleSection("careerPaths")}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-xl hover:from-green-600 hover:to-teal-600 transition-all"
        >
          <div className="flex items-center gap-3">
            <BriefcaseIcon className="h-6 w-6" />
            <h2 className="text-xl font-bold">
              Career Paths ({analysis.recommendations?.careerPaths?.length || 0}
              )
            </h2>
          </div>
          <svg
            className={`w-6 h-6 transition-transform ${expandedSections.careerPaths ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {expandedSections.careerPaths && (
          <div className="border-2 border-gray-200 dark:border-gray-700 border-t-0 rounded-b-xl p-4 bg-white dark:bg-gray-800">
            <div className="grid md:grid-cols-2 gap-4">
              {analysis.recommendations?.careerPaths?.map((career, index) => (
                <div
                  key={index}
                  className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {career.title}
                    </h3>
                    <span
                      className={`font-semibold ${getMatchColor(career.matchPercentage)}`}
                    >
                      {career.matchPercentage}%
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                    {career.description}
                  </p>
                  <div className="mb-3">
                    {renderMatchBar(career.matchPercentage)}
                  </div>
                  <div className="mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      Required Skills:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {career.requiredSkills?.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Salary:</strong> {career.salaryRange}
                  </p>
                  {career.growthPotential && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Growth:</strong> {career.growthPotential}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Skill Development Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <button
          onClick={() => toggleSection("skillDevelopment")}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-xl hover:from-orange-600 hover:to-red-600 transition-all"
        >
          <div className="flex items-center gap-3">
            <LightBulbIcon className="h-6 w-6" />
            <h2 className="text-xl font-bold">
              Skill Development (
              {analysis.recommendations?.skillDevelopment?.length || 0})
            </h2>
          </div>
          <svg
            className={`w-6 h-6 transition-transform ${expandedSections.skillDevelopment ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {expandedSections.skillDevelopment && (
          <div className="border-2 border-gray-200 dark:border-gray-700 border-t-0 rounded-b-xl p-4 bg-white dark:bg-gray-800">
            <div className="grid gap-4">
              {analysis.recommendations?.skillDevelopment?.map(
                (skillGroup, index) => (
                  <div
                    key={index}
                    className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {skillGroup.category}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          skillGroup.priority === "High"
                            ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                            : skillGroup.priority === "Medium"
                              ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                              : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {skillGroup.priority} Priority
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                        Skills to develop:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {skillGroup.skills?.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    {skillGroup.resources && (
                      <div className="mb-2">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                          Resources:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                          {skillGroup.resources.map((resource, idx) => (
                            <li key={idx}>{resource}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {skillGroup.estimatedTime && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        Estimated time: {skillGroup.estimatedTime}
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl flex items-start gap-3"
      >
        <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">
            Analysis saved to your history!
          </h4>
          <p className="text-sm text-green-700 dark:text-green-400">
            You can view this analysis anytime from your history. Use the
            regenerate button to get updated recommendations based on your
            latest profile.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OpportunityResults;
