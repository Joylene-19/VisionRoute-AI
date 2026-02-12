import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EducationLevelSelector from "../components/opportunity/EducationLevelSelector";
import AdaptiveForm from "../components/opportunity/AdaptiveForm";
import OpportunityResults from "../components/opportunity/OpportunityResults";
import AnalysisHistory from "../components/opportunity/AnalysisHistory";
import api from "../services/api";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";

const OpportunityAnalyzer = () => {
  const [step, setStep] = useState(1);
  const [educationLevel, setEducationLevel] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch analysis history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get("/api/opportunity/history");
      setHistoryData(response.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleLevelSelect = (level) => {
    setEducationLevel(level);
    setStep(2);
  };

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/api/opportunity", {
        educationLevel,
        ...formData,
      });

      setAnalysisResult(response.data);
      setStep(3);

      // Refresh history
      fetchHistory();
    } catch (err) {
      console.error("Analysis submission failed:", err);
      setError(
        err.response?.data?.message ||
          "Failed to generate analysis. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (analysisId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(
        `/api/opportunity/${analysisId}/regenerate`,
      );
      setAnalysisResult(response.data);

      // Refresh history
      fetchHistory();
    } catch (err) {
      console.error("Regeneration failed:", err);
      setError(
        err.response?.data?.message ||
          "Failed to regenerate analysis. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartNew = () => {
    setStep(1);
    setEducationLevel(null);
    setAnalysisResult(null);
    setError(null);
  };

  const handleViewHistory = async (analysisId) => {
    try {
      const response = await api.get(`/api/opportunity/${analysisId}`);
      setAnalysisResult(response.data);
      setEducationLevel(response.data.educationLevel);
      setStep(3);
      setShowHistory(false);
    } catch (err) {
      console.error("Failed to load analysis:", err);
      setError("Failed to load analysis. Please try again.");
    }
  };

  const handleDeleteHistory = async (analysisId) => {
    try {
      await api.delete(`/api/opportunity/${analysisId}`);

      // Refresh history
      fetchHistory();

      // If viewing deleted analysis, go back to start
      if (analysisResult?._id === analysisId) {
        handleStartNew();
      }
    } catch (err) {
      console.error("Failed to delete analysis:", err);
      setError("Failed to delete analysis. Please try again.");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <EducationLevelSelector
            onSelect={handleLevelSelect}
            selectedLevel={educationLevel}
          />
        );

      case 2:
        return (
          <AdaptiveForm
            educationLevel={educationLevel}
            onSubmit={handleFormSubmit}
            onBack={() => setStep(1)}
          />
        );

      case 3:
        return (
          <OpportunityResults
            analysis={analysisResult}
            onRegenerate={handleRegenerate}
            onStartNew={handleStartNew}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Opportunity Analyzer
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover scholarships, education paths, and career opportunities
              tailored for you
            </p>
          </div>

          {/* History Toggle Button (Mobile) */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="lg:hidden p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
          >
            {showHistory ? (
              <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Stepper */}
        {step !== 3 && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      step === stepNum
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg scale-110"
                        : step > stepNum
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step > stepNum ? "✓" : stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div
                      className={`w-16 h-1 ${
                        step > stepNum
                          ? "bg-green-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="text-center">
                <p
                  className={`text-sm font-medium ${step >= 1 ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`}
                >
                  Choose Level
                </p>
              </div>
              <div className="w-16"></div>
              <div className="text-center">
                <p
                  className={`text-sm font-medium ${step >= 2 ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`}
                >
                  Fill Details
                </p>
              </div>
              <div className="w-16"></div>
              <div className="text-center">
                <p
                  className={`text-sm font-medium ${step >= 3 ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`}
                >
                  View Results
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {step === 2
                      ? "Generating your personalized analysis..."
                      : "Regenerating analysis..."}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    This may take a few moments
                  </p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* History Sidebar (Desktop) */}
          <div className="hidden lg:block w-80">
            <div className="sticky top-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[600px]">
              <AnalysisHistory
                analyses={historyData}
                onView={handleViewHistory}
                onDelete={handleDeleteHistory}
                currentAnalysisId={analysisResult?._id}
              />
            </div>
          </div>
        </div>

        {/* History Modal (Mobile) */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end"
              onClick={() => setShowHistory(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="w-full bg-white dark:bg-gray-800 rounded-t-2xl max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <AnalysisHistory
                  analyses={historyData}
                  onView={handleViewHistory}
                  onDelete={handleDeleteHistory}
                  currentAnalysisId={analysisResult?._id}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OpportunityAnalyzer;
