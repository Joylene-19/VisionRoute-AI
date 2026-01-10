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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            No questions available
          </h2>
          <p className="text-gray-600 mt-2">Please contact support.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Stream Guidance Assessment
          </h1>
          <p className="text-gray-600 mt-2">
            Answer honestly for the most accurate recommendations
          </p>

          {/* Auto-save indicator */}
          {lastSaved && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Auto-saved at {lastSaved.toLocaleTimeString()}
            </p>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-700 font-medium">
                Submitting assessment...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessment;
