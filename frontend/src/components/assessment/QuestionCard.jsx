import PropTypes from "prop-types";

const QuestionCard = ({
  question,
  value,
  onChange,
  onNext,
  onPrevious,
  currentIndex,
  totalQuestions,
}) => {
  const renderOptions = () => {
    switch (question.questionType) {
      case "rating_scale":
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  value === option.value
                    ? "border-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-md"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question._id}`}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() =>
                    onChange(question._id, option.value, option.score)
                  }
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <span
                  className={`ml-3 ${
                    value === option.value
                      ? "text-gray-900 dark:text-white font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {option.text}
                </span>
              </label>
            ))}
          </div>
        );

      case "multiple_choice":
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  value === option.value
                    ? "border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-md"
                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question._id}`}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() =>
                    onChange(question._id, option.value, option.score)
                  }
                  className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                />
                <span
                  className={`ml-3 ${
                    value === option.value
                      ? "text-gray-900 dark:text-white font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {option.text}
                </span>
              </label>
            ))}
          </div>
        );

      case "yes_no":
        return (
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((option) => (
              <label
                key={option.value}
                className={`flex items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
                  value === option.value
                    ? "border-teal-600 bg-gradient-to-br from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 shadow-md"
                    : "border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 bg-white dark:bg-gray-800"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question._id}`}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() =>
                    onChange(question._id, option.value, option.score)
                  }
                  className="sr-only"
                />
                <span
                  className={`text-lg font-semibold ${
                    value === option.value
                      ? "text-teal-700 dark:text-teal-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {option.text}
                </span>
              </label>
            ))}
          </div>
        );

      default:
        return <p className="text-gray-500">Unsupported question type</p>;
    }
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl p-6 md:p-8 max-w-3xl mx-auto border border-gray-100 dark:border-gray-800">
      {/* Category badge */}
      <div className="mb-4">
        <span className="inline-block px-4 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 rounded-full">
          {question.category.charAt(0).toUpperCase() +
            question.category.slice(1)}
        </span>
      </div>

      {/* Question text */}
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {question.questionText}
      </h2>

      {/* Help text */}
      {question.helpText && (
        <p className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
          <span className="font-semibold">Tip:</span> {question.helpText}
        </p>
      )}

      {/* Answer options */}
      <div className="mb-8">{renderOptions()}</div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            currentIndex === 0
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md hover:shadow-lg"
          }`}
        >
          ← Previous
        </button>

        <button
          onClick={onNext}
          disabled={!value}
          className={`px-8 py-3 rounded-xl font-semibold transition-all ${
            !value
              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
          }`}
        >
          {currentIndex === totalQuestions - 1 ? "Finish" : "Next →"}
        </button>
      </div>

      {/* Required indicator */}
      {question.isRequired && !value && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
          * This question is required
        </p>
      )}
    </div>
  );
};

QuestionCard.propTypes = {
  question: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    questionText: PropTypes.string.isRequired,
    questionType: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        score: PropTypes.number,
      })
    ).isRequired,
    helpText: PropTypes.string,
    isRequired: PropTypes.bool,
  }).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  currentIndex: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
};

export default QuestionCard;
