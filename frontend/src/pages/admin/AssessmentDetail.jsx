import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import RIASECRadarChart from "../../components/charts/RIASECRadarChart";
import AptitudeBarChart from "../../components/charts/AptitudeBarChart";

const AssessmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    fetchAssessmentDetail();
  }, [id]);

  const fetchAssessmentDetail = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching assessment ID:", id);
      const response = await api.get(`/api/admin/assessments/${id}`);

      console.log("📦 API Response:", response);
      console.log("✅ Response success:", response.success);
      console.log("📊 Assessment data:", response.data);
      console.log("📈 Scores:", response.data?.scores);

      if (response.success) {
        setAssessment(response.data);

        // Try to fetch analysis if completed (optional - don't fail if missing)
        if (response.data.status === "completed") {
          try {
            const analysisRes = await api.get(`/api/analysis/${id}`);
            if (analysisRes.success) {
              setAnalysis(analysisRes.data);
            }
          } catch (analysisError) {
            console.warn(
              "⚠️ Analysis not found (this is OK):",
              analysisError.message
            );
            // Analysis is optional, continue without it
          }
        }
      } else {
        toast.error("Assessment not found");
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
      toast.error("Failed to load assessment details");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      toast.loading("Generating PDF...", { id: "pdf" });

      // Use admin PDF endpoint with token from auth store
      const response = await fetch(
        `http://localhost:5000/api/pdf/admin/assessment/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Assessment_Report_${
        assessment?.user?.name || "User"
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully!", { id: "pdf" });
    } catch (error) {
      console.error("PDF Download Error:", error);
      toast.error(error.message || "Failed to export PDF", { id: "pdf" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">
          Assessment not found
        </h3>
        <button
          onClick={() => navigate("/admin/assessments")}
          className="mt-4 text-indigo-600 hover:text-indigo-500"
        >
          Back to Assessments
        </button>
      </div>
    );
  }

  // Log full scores structure to debug
  console.log("📊 Full scores object:", assessment.scores);
  console.log("📊 assessment.scores?.interest:", assessment.scores?.interest);
  console.log("📊 assessment.scores?.aptitude:", assessment.scores?.aptitude);

  const riasecData =
    assessment.scores?.riasec || assessment.scores?.interest || {};
  const aptitudeData =
    assessment.scores?.aptitudes || assessment.scores?.aptitude || {};

  console.log("📊 RIASEC Data (after extraction):", riasecData);
  console.log("📊 Aptitude Data (after extraction):", aptitudeData);
  console.log("📊 riasecData.realistic:", riasecData.realistic);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/assessments")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Assessment Details
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              View complete assessment results and analysis
            </p>
          </div>
        </div>
        {assessment.status === "completed" && (
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            Download PDF
          </button>
        )}
      </div>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Student Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4">
            {assessment.user?.profilePhoto ? (
              <img
                src={assessment.user.profilePhoto}
                alt=""
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-white text-2xl font-medium">
                  {assessment.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {assessment.user?.name || "Unknown User"}
              </p>
              <p className="text-sm text-gray-600">
                {assessment.user?.email || "N/A"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`inline-flex px-3 py-1 mt-1 text-xs font-semibold rounded-full ${
                  assessment.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {assessment.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <p className="font-semibold text-gray-900 mt-1">
                {assessment.answeredQuestions}/{assessment.totalQuestions}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Submitted</p>
              <p className="font-semibold text-gray-900 mt-1">
                {assessment.submittedAt
                  ? new Date(assessment.submittedAt).toLocaleDateString()
                  : "Not submitted"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time Spent</p>
              <p className="font-semibold text-gray-900 mt-1">
                {assessment.timeSpent
                  ? `${Math.floor(assessment.timeSpent / 60)}h ${
                      assessment.timeSpent % 60
                    }m`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {assessment.status === "completed" && (
        <>
          {/* RIASEC Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              RIASEC Personality Profile
            </h2>
            <RIASECRadarChart scores={riasecData} />
          </div>

          {/* Aptitude Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Aptitude Scores
            </h2>
            <AptitudeBarChart scores={aptitudeData} />
          </div>

          {/* AI Analysis */}
          {analysis && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                AI Career Analysis
              </h2>
              <div className="prose max-w-none">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Summary
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>

                {analysis.recommendedStream && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Recommended Academic Stream
                    </h3>
                    <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg font-semibold">
                      {analysis.recommendedStream}
                    </div>
                  </div>
                )}

                {analysis.careerMatches &&
                  analysis.careerMatches.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Top Career Matches
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysis.careerMatches.map((career, index) => (
                          <div
                            key={index}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {career.title}
                              </h4>
                              <span className="text-sm font-semibold text-indigo-600">
                                {career.matchPercentage}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {career.description}
                            </p>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">
                                  Education:
                                </span>{" "}
                                <span className="text-gray-600">
                                  {career.education}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Salary Range:
                                </span>{" "}
                                <span className="text-gray-600">
                                  {career.salaryRange}
                                </span>
                              </div>
                              {career.skills && career.skills.length > 0 && (
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Key Skills:
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {career.skills.map((skill, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </>
      )}

      {assessment.status !== "completed" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">
            This assessment is still in progress. Results will be available once
            completed.
          </p>
        </div>
      )}
    </div>
  );
};

export default AssessmentDetail;
