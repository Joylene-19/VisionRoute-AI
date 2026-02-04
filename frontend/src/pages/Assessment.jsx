import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import QuestionCard from "../components/assessment/QuestionCard";
import toast from "react-hot-toast";

const Assessment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Initialize assessment
  useEffect(() => {
    initializeAssessment();
  }, []);

  const initializeAssessment = async () => {
    try {
      setLoading(true);

      // Check for existing assessment
      const resumeRes = await api.get("/api/assessments/resume");

      if (resumeRes.success && resumeRes.data) {
        // Resume existing assessment
        setAssessment(resumeRes.data);
        loadExistingResponses(resumeRes.data);
        toast.success("Resuming your assessment");
      }
    } catch (error) {
      // No assessment in progress, start new one
      if (error.response?.status === 404) {
        await startNewAssessment();
      } else {
        toast.error("Error loading assessment");
        console.error(error);
      }
    } finally {
      await loadQuestions();
      setLoading(false);
    }
  };

  const startNewAssessment = async () => {
    try {
      const response = await api.post("/api/assessments/start");
      if (response.success && response.data) {
        setAssessment(response.data);
        toast.success("Assessment started!");
      }
    } catch (error) {
      toast.error("Failed to start assessment");
      console.error(error);
    }
  };

  const loadQuestions = async () => {
    try {
      const response = await api.get("/api/assessments/questions");
      if (response.success && response.data) {
        setQuestions(response.data);
      }
    } catch (error) {
      toast.error("Failed to load questions");
      console.error(error);
    }
  };

  const loadExistingResponses = (assessmentData) => {
    const responsesMap = {};
    assessmentData.responses.forEach((r) => {
      responsesMap[r.questionId] = {
        value: r.answer,
        score: r.score,
      };
    });
    setResponses(responsesMap);

    // Set current index to first unanswered question
    const firstUnanswered = questions.findIndex((q) => !responsesMap[q._id]);
    if (firstUnanswered >= 0) {
      setCurrentIndex(firstUnanswered);
    }
  };

  // Handle answer change
  const handleAnswerChange = (questionId, value, score) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { value, score },
    }));

    // Trigger auto-save after 2 seconds of inactivity
    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    const timer = setTimeout(() => {
      saveProgress();
    }, 2000);

    setAutoSaveTimer(timer);
  };

  // Auto-save progress
  const saveProgress = useCallback(async () => {
    if (!assessment) return;

    try {
      const responsesArray = Object.keys(responses).map((questionId) => ({
        questionId,
        answer: responses[questionId].value,
        score: responses[questionId].score,
      }));

      await api.put(`/api/assessments/${assessment._id}/save`, {
        responses: responsesArray,
        currentStep: currentIndex + 1,
        currentCategory: questions[currentIndex]?.category,
      });

      setLastSaved(new Date());
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [assessment, responses, currentIndex, questions]);

  // Navigate to next question
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      saveProgress();
    } else {
      // Last question - submit assessment
      handleSubmit();
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Submit assessment
  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredCount = questions.filter((q) => !responses[q._id]).length;

    if (unansweredCount > 0) {
      toast.error(`Please answer all questions. ${unansweredCount} remaining.`);
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post(
        `/api/assessments/${assessment._id}/submit`
      );

      if (response.success) {
        if (response.data.alreadyCompleted) {
          toast.success("Redirecting to your results...");
        } else {
          toast.success("Assessment submitted successfully!");
        }
        // Navigate to results page (will be created in Module 4)
        navigate("/results", { state: { assessmentId: assessment._id } });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit assessment"
      );
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Clean up auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [autoSaveTimer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">
            Loading assessment...
          </p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            No questions available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Please contact support.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-soft dark:bg-dark-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Stream Guidance Assessment
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
            Answer honestly for the most accurate recommendations
          </p>

          {/* Progress Bar */}
          <div className="mt-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Auto-save indicator */}
          {lastSaved && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                Auto-saved at {lastSaved.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            value={responses[currentQuestion._id]?.value}
            onChange={handleAnswerChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
          />
        )}

        {/* Submit overlay */}
        {submitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-8 text-center shadow-2xl">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-700 dark:text-white font-semibold text-lg">
                Submitting assessment...
              </p>
              <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                Analyzing your responses
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessment;
