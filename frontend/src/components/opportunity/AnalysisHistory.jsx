import { motion } from "framer-motion";
import {
  ClockIcon,
  TrashIcon,
  EyeIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  BookOpen,
  GraduationCap,
  ScrollText,
  Target,
  Trophy,
  Book,
  DollarSign,
  Briefcase,
  RefreshCw,
} from "lucide-react";

const AnalysisHistory = ({ analyses, onView, onDelete, currentAnalysisId }) => {
  const getConfidenceBadge = (score) => {
    if (score >= 80) {
      return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
    } else if (score >= 60) {
      return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
    } else {
      return "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getEducationIcon = (level) => {
    const icons = {
      "10th Pass": BookOpen,
      "12th Pass": GraduationCap,
      Diploma: ScrollText,
      "Bachelor Degree": Target,
      "Master Degree": Trophy,
    };
    return icons[level] || Book;
  };

  if (!analyses || analyses.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <ClockIcon className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No Previous Analyses
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Your analysis history will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Analysis History
          </h2>
          <span className="ml-auto px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold">
            {analyses.length}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {analyses.map((analysis, index) => (
          <motion.div
            key={analysis._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
              analysis._id === currentAnalysisId
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  {(() => {
                    const IconComponent = getEducationIcon(
                      analysis.educationLevel,
                    );
                    return (
                      <IconComponent
                        className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                        strokeWidth={1.8}
                      />
                    );
                  })()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {analysis.educationLevel}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(analysis.createdAt)}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${getConfidenceBadge(analysis.confidenceScore)}`}
              >
                {analysis.confidenceScore}%
              </span>
            </div>

            {/* Top Recommendations Preview */}
            <div className="mb-3 space-y-1">
              {analysis.recommendations?.scholarships?.[0] && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 truncate">
                  <DollarSign
                    className="w-3.5 h-3.5 flex-shrink-0 text-green-600 dark:text-green-400"
                    strokeWidth={2}
                  />
                  <span className="truncate">
                    {analysis.recommendations.scholarships[0].name}
                  </span>
                </div>
              )}
              {analysis.recommendations?.careerPaths?.[0] && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 truncate">
                  <Briefcase
                    className="w-3.5 h-3.5 flex-shrink-0 text-blue-600 dark:text-blue-400"
                    strokeWidth={2}
                  />
                  <span className="truncate">
                    {analysis.recommendations.careerPaths[0].title}
                  </span>
                </div>
              )}
            </div>

            {/* Regeneration count */}
            {analysis.regenerationCount > 0 && (
              <div className="mb-3 flex items-center gap-1">
                <RefreshCw
                  className="w-3 h-3 text-purple-600 dark:text-purple-400"
                  strokeWidth={2.5}
                />
                <span className="text-xs text-purple-600 dark:text-purple-400">
                  Regenerated {analysis.regenerationCount}×
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(analysis._id);
                }}
                className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <EyeIcon className="h-4 w-4" />
                View
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    window.confirm(
                      "Delete this analysis? This cannot be undone.",
                    )
                  ) {
                    onDelete(analysis._id);
                  }
                }}
                className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More Hint */}
      {analyses.length >= 20 && (
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Showing last 20 analyses
        </div>
      )}
    </div>
  );
};

export default AnalysisHistory;
