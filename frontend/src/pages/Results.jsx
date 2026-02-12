import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import toast from "react-hot-toast";
import RIASECRadarChart from "../components/charts/RIASECRadarChart";
import AptitudeBarChart from "../components/charts/AptitudeBarChart";
import { generateCareerReportPDF } from "../utils/pdfExport";
import useAuthStore from "../store/authStore";
import { BookmarkIcon as BookmarkOutlineIcon } from "@heroicons/react/24/outline";
import {
  BookmarkIcon as BookmarkSolidIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/solid";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL params
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [scores, setScores] = useState(null);
  const [bookmarkedCareers, setBookmarkedCareers] = useState(new Set());

  // Get assessment ID from either URL params or location state
  const assessmentId = id || location.state?.assessmentId;

  const loadResults = async () => {
    try {
      setLoading(true);

      // Try to get existing analysis
      const response = await api.get(`/api/analysis/${assessmentId}`);

      if (response.success) {
        setAnalysis(response.data.analysis);
        setScores(response.data.scores);
      }
    } catch (error) {
      // Analysis doesn't exist, need to generate
      if (error.response?.data?.needsGeneration) {
        await generateAnalysis();
      } else {
        toast.error("Failed to load results");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (career) => {
    const isBookmarked = bookmarkedCareers.has(career.title);

    try {
      if (isBookmarked) {
        // Remove bookmark
        await api.delete(
          `/api/bookmarks/career/${encodeURIComponent(career.title)}`,
        );
        setBookmarkedCareers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(career.title);
          return newSet;
        });
        toast.success("Bookmark removed");
      } else {
        // Add bookmark
        // Parse matchScore - handle both number (95) and string ("95%") formats
        let matchPercentage = career.matchScore;
        if (typeof matchPercentage === "string") {
          matchPercentage = parseInt(matchPercentage.replace("%", ""));
        }

        await api.post("/api/bookmarks", {
          careerTitle: career.title,
          careerDescription: career.description,
          matchPercentage: matchPercentage || 0,
          category: career.category || "General",
        });
        setBookmarkedCareers((prev) => new Set([...prev, career.title]));
        toast.success("Career bookmarked!");
      }
    } catch (error) {
      console.error("Bookmark error:", error);
      toast.error(
        isBookmarked ? "Failed to remove bookmark" : "Failed to add bookmark",
      );
    }
  };

  const loadBookmarks = async () => {
    try {
      const response = await api.get("/api/bookmarks");
      if (response.success) {
        const titles = new Set(response.data.map((b) => b.careerTitle));
        setBookmarkedCareers(titles);
      }
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    }
  };

  useEffect(() => {
    if (assessmentId) {
      loadResults();
      loadBookmarks();
    }
  }, [assessmentId]);

  const generateAnalysis = async () => {
    try {
      setGenerating(true);
      toast.loading("Generating AI career analysis...", { id: "generating" });

      const response = await api.post(`/api/analysis/${assessmentId}/generate`);

      if (response.success) {
        setAnalysis(response.data);
        toast.success("Analysis generated successfully!", { id: "generating" });

        // Reload to get scores
        const fullResponse = await api.get(`/api/analysis/${assessmentId}`);
        setScores(fullResponse.data.scores);
      }
    } catch (error) {
      toast.error("Failed to generate analysis", { id: "generating" });
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      toast.loading("Generating PDF...", { id: "pdf" });

      // Call backend API to generate PDF
      const response = await fetch(
        `http://localhost:5000/api/pdf/assessment/${assessmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      // Convert response to blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `VisionRoute_Report_${
        user?.displayName || "Student"
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully!", { id: "pdf" });
    } catch (error) {
      console.error("PDF Download Error:", error);
      toast.error(`Failed to export PDF: ${error.message}`, { id: "pdf" });
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft dark:bg-dark-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium text-lg">
            Loading your results...
          </p>
        </div>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft dark:bg-dark-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-2xl p-8"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analyzing Your Assessment...
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Our AI is processing your responses to generate personalized career
            recommendations.
          </p>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            This may take 10-30 seconds
          </p>
        </motion.div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Analysis not available
          </h2>
          <button
            onClick={generateAnalysis}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Generate Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" id="results-content">
      <div className="max-w-6xl mx-auto">
        {/* Header with Actions */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Your Career Analysis
              </h1>
              <p className="text-gray-600">{analysis.summary}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportPDF}
                disabled={exportingPDF}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  exportingPDF
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {exportingPDF ? "Generating..." : "Download PDF"}
              </button>
              <button
                onClick={generateAnalysis}
                disabled={generating}
                className="px-6 py-2 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>

        {/* Visual Charts Section */}
        {scores && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {scores.riasec && <RIASECRadarChart scores={scores.riasec} />}
            {scores.aptitude && <AptitudeBarChart scores={scores.aptitude} />}
          </div>
        )}

        {/* Recommended Stream */}
        {analysis.recommendedStream && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md p-8 mb-6 text-white">
            <h2 className="text-2xl font-bold mb-2">
              Recommended Stream:{" "}
              {typeof analysis.recommendedStream === "string"
                ? analysis.recommendedStream
                : analysis.recommendedStream.primary}
            </h2>
            {typeof analysis.recommendedStream === "object" &&
              analysis.recommendedStream.reasoning && (
                <p className="text-indigo-100 mb-4">
                  {analysis.recommendedStream.reasoning}
                </p>
              )}
            {typeof analysis.recommendedStream === "object" &&
              analysis.recommendedStream.alternatives && (
                <div>
                  <p className="font-semibold mb-2">Alternative Options:</p>
                  <div className="flex gap-2">
                    {analysis.recommendedStream.alternatives.map((alt, idx) => (
                      <span
                        key={idx}
                        className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm"
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* RIASEC Profile */}
          {analysis.riasecProfile && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Your RIASEC Profile
              </h3>
              <div className="bg-indigo-50 rounded-lg p-4 mb-3">
                <p className="text-sm text-gray-600">Top Traits</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {analysis.riasecProfile.topTraits
                    ? analysis.riasecProfile.topTraits.slice(0, 2).join(", ")
                    : analysis.riasecProfile.dominantType || "Not specified"}
                </p>
              </div>
              <p className="text-gray-700">
                {analysis.riasecProfile.description}
              </p>
            </div>
          )}

          {/* Subject Recommendations */}
          {(analysis.subjectRecommendations ||
            analysis.recommendedSubjects) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Recommended Subjects
              </h3>
              {analysis.subjectRecommendations && (
                <>
                  <div className="mb-4">
                    <p className="font-semibold text-gray-700 mb-2">
                      Core Subjects:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.subjectRecommendations.core?.map(
                        (subject, idx) => (
                          <span
                            key={idx}
                            className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {subject}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                  {analysis.subjectRecommendations.electives && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-2">
                        Electives:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.subjectRecommendations.electives.map(
                          (subject, idx) => (
                            <span
                              key={idx}
                              className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {subject}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
              {analysis.recommendedSubjects &&
                !analysis.subjectRecommendations && (
                  <div className="flex flex-wrap gap-2">
                    {analysis.recommendedSubjects.map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {typeof item === "string" ? item : item.subject}
                      </span>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Career Paths */}
        {analysis.careerPaths && analysis.careerPaths.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Top Career Recommendations
            </h3>
            <div className="space-y-4">
              {analysis.careerPaths.map((career, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800">
                        {career.title}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      {career.matchScore && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {career.matchScore}
                        </span>
                      )}
                      <button
                        onClick={() => handleToggleBookmark(career)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={
                          bookmarkedCareers.has(career.title)
                            ? "Remove bookmark"
                            : "Bookmark this career"
                        }
                      >
                        {bookmarkedCareers.has(career.title) ? (
                          <BookmarkSolidIcon className="w-6 h-6 text-indigo-600" />
                        ) : (
                          <BookmarkOutlineIcon className="w-6 h-6 text-gray-400 hover:text-indigo-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{career.description}</p>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    {career.requiredEducation && (
                      <div>
                        <p className="font-semibold text-gray-700">
                          Required Education:
                        </p>
                        <p className="text-gray-600">
                          {career.requiredEducation}
                        </p>
                      </div>
                    )}
                    {career.entranceExams &&
                      career.entranceExams.length > 0 && (
                        <div>
                          <p className="font-semibold text-gray-700">
                            Entrance Exams:
                          </p>
                          <p className="text-gray-600">
                            {career.entranceExams.join(", ")}
                          </p>
                        </div>
                      )}
                    {career.topColleges && career.topColleges.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-700">
                          Top Colleges:
                        </p>
                        <p className="text-gray-600">
                          {career.topColleges.slice(0, 2).join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          {analysis.strengths && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Your Strengths
              </h3>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Development Areas */}
          {analysis.developmentAreas && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Areas for Development
              </h3>
              <ul className="space-y-2">
                {analysis.developmentAreas.map((area, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-orange-500 mr-2">→</span>
                    <span className="text-gray-700">{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Plan */}
        {analysis.actionPlan && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Your Action Plan
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-bold text-indigo-600 mb-2">
                  Immediate Actions
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  {analysis.actionPlan.immediate?.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-purple-600 mb-2">
                  Short-term (6 months)
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  {analysis.actionPlan.shortTerm?.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-pink-600 mb-2">
                  Long-term (1+ year)
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  {analysis.actionPlan.longTerm?.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* AI Chat Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 mb-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-4 rounded-full">
                <ChatBubbleLeftRightIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Have Questions About Your Results?
                </h3>
                <p className="text-blue-100">
                  Chat with our AI Career Counselor for personalized guidance on
                  careers, colleges, entrance exams, and more!
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/ai-chat")}
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold hover:shadow-2xl transition-shadow whitespace-nowrap"
            >
              Chat Now
            </motion.button>
          </div>
        </motion.div>

        {/* Resources */}
        {analysis.resources && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Recommended Resources
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {analysis.resources.books && (
                <div>
                  <h4 className="font-bold text-gray-700 mb-2">📚 Books</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                    {analysis.resources.books.map((book, idx) => (
                      <li key={idx}>{book}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.resources.websites && (
                <div>
                  <h4 className="font-bold text-gray-700 mb-2">🌐 Websites</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                    {analysis.resources.websites.map((site, idx) => (
                      <li key={idx}>{site}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.resources.courses && (
                <div>
                  <h4 className="font-bold text-gray-700 mb-2">💻 Courses</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                    {analysis.resources.courses.map((course, idx) => (
                      <li key={idx}>{course}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/profile")}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Back to Profile
          </button>
          <button
            onClick={() => generateAnalysis()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Regenerate Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
