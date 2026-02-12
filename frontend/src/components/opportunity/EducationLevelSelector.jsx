import { motion } from "framer-motion";
import { EDUCATION_LEVELS } from "../../utils/opportunityFormFields";

const EducationLevelSelector = ({ onSelect, selectedLevel }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Select Your Education Level
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose the highest level you have completed or are currently pursuing
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EDUCATION_LEVELS.map((level, index) => (
          <motion.button
            key={level.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(level.value)}
            className={`p-6 rounded-xl border-2 transition-all ${
              selectedLevel === level.value
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-gray-800"
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">{level.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {level.label}
              </h3>
              {selectedLevel === level.value && (
                <div className="flex items-center justify-center gap-1 text-indigo-600 dark:text-indigo-400 text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Selected</span>
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {selectedLevel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => onSelect(selectedLevel)}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            Continue →
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default EducationLevelSelector;
