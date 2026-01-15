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
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  value === option.value
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
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
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-3 text-gray-700">{option.text}</span>
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
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  value === option.value
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
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
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-3 text-gray-700">{option.text}</span>
              </label>
            ))}
          </div>
        );

      case "yes_no":
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  value === option.value
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
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
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-3 text-gray-700">{option.text}</span>
              </label>
            ))}
          </div>
        );

      default:
        return <p className="text-gray-500">Unsupported question type</p>;
    }
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 md:p-8 max-w-3xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
          <span>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="font-medium text-indigo-600 dark:text-indigo-400">
            {Math.round(((currentIndex + 1) / totalQuestions) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Category badge */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/40 rounded-full">
          {question.category.charAt(0).toUpperCase() +
            question.category.slice(1)}
        </span>
      </div>

      {/* Question text */}
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-6">
        {question.questionText}
      </h2>

      {/* Help text */}
      {question.helpText && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 italic">
          💡 {question.helpText}
        </p>
      )}

      {/* Answer options */}
      <div className="mb-8">{renderOptions()}</div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center pt-6 border-t dark:border-gray-700">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            currentIndex === 0
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          ← Previous
        </button>

        <button
          onClick={onNext}
          disabled={!value}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            !value
              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
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
