import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CalendarIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const AssessmentHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState([]);
  const [selectedComparison, setSelectedComparison] = useState("all");

  useEffect(() => {
    fetchAssessmentHistory();
  }, []);

  const fetchAssessmentHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/assessments/history");

      if (response.success) {
        setAssessments(response.data);
      }
    } catch (error) {
      toast.error("Failed to load assessment history");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeAssessment = () => {
    navigate("/assessment");
  };

  const handleViewResults = (id) => {
    navigate(`/results/${id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case "in-progress":
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <ArrowPathIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  // Prepare comparison data
  const getComparisonData = () => {
    const completedAssessments = assessments.filter(
      (a) => a.status === "completed"
    );

    if (completedAssessments.length === 0) return null;

    // RIASEC comparison over time
    const riasecComparison = completedAssessments.map((assessment, index) => ({
      attempt: `Attempt ${index + 1}`,
      date: new Date(assessment.completedAt).toLocaleDateString(),
      realistic: assessment.scores?.interest?.realistic || 0,
      investigative: assessment.scores?.interest?.investigative || 0,
      artistic: assessment.scores?.interest?.artistic || 0,
      social: assessment.scores?.interest?.social || 0,
      enterprising: assessment.scores?.interest?.enterprising || 0,
      conventional: assessment.scores?.interest?.conventional || 0,
    }));

    // Aptitude comparison over time
    const aptitudeComparison = completedAssessments.map(
      (assessment, index) => ({
        attempt: `Attempt ${index + 1}`,
        date: new Date(assessment.completedAt).toLocaleDateString(),
        logical: assessment.scores?.aptitude?.logical || 0,
        numerical: assessment.scores?.aptitude?.numerical || 0,
        verbal: assessment.scores?.aptitude?.verbal || 0,
        spatial: assessment.scores?.aptitude?.spatial || 0,
      })
    );

    // Latest vs Previous comparison (for radar chart)
    if (completedAssessments.length >= 2) {
      const latest = completedAssessments[completedAssessments.length - 1];
      const previous = completedAssessments[completedAssessments.length - 2];

      const radarData = [
        {
          dimension: "Realistic",
          current: latest.scores?.interest?.realistic || 0,
          previous: previous.scores?.interest?.realistic || 0,
        },
        {
          dimension: "Investigative",
          current: latest.scores?.interest?.investigative || 0,
          previous: previous.scores?.interest?.investigative || 0,
        },
        {
          dimension: "Artistic",
          current: latest.scores?.interest?.artistic || 0,
          previous: previous.scores?.interest?.artistic || 0,
        },
        {
          dimension: "Social",
          current: latest.scores?.interest?.social || 0,
          previous: previous.scores?.interest?.social || 0,
        },
        {
          dimension: "Enterprising",
          current: latest.scores?.interest?.enterprising || 0,
          previous: previous.scores?.interest?.enterprising || 0,
        },
        {
          dimension: "Conventional",
          current: latest.scores?.interest?.conventional || 0,
          previous: previous.scores?.interest?.conventional || 0,
        },
      ];

      return { riasecComparison, aptitudeComparison, radarData };
    }

    return { riasecComparison, aptitudeComparison, radarData: null };
  };

  const comparisonData = getComparisonData();
  const completedCount = assessments.filter(
    (a) => a.status === "completed"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Assessment History
          </h1>
          <p className="text-gray-600 mt-2">
            Track your progress and compare results over time
          </p>
        </div>
        <button
          onClick={handleRetakeAssessment}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5" />
          <span>Retake Assessment</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Attempts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {assessments.length}
              </p>
            </div>
            <ChartBarIcon className="w-10 h-10 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {completedCount}
              </p>
            </div>
            <CheckCircleIcon className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {assessments.length - completedCount}
              </p>
            </div>
            <ClockIcon className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Assessments List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Assessments
          </h2>
        </div>

        {assessments.length === 0 ? (
          <div className="p-12 text-center">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No assessments yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start your first assessment to discover your career path
            </p>
            <button
              onClick={handleRetakeAssessment}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Take Assessment
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {assessments.map((assessment, index) => (
              <div
                key={assessment._id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getStatusIcon(assessment.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Attempt #{assessments.length - index}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            assessment.status
                          )}`}
                        >
                          {assessment.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>
                            {assessment.completedAt
                              ? new Date(
                                  assessment.completedAt
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : new Date(
                                  assessment.createdAt
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                          </span>
                        </div>
                        {assessment.timeSpentMinutes && (
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>
                              {Math.floor(assessment.timeSpentMinutes / 60)}h{" "}
                              {assessment.timeSpentMinutes % 60}m
                            </span>
                          </div>
                        )}
                        <div>
                          Progress: {assessment.questionsAnswered || 0}/
                          {assessment.totalQuestions || 85}
                        </div>
                      </div>
                    </div>
                  </div>

                  {assessment.status === "completed" && (
                    <button
                      onClick={() => handleViewResults(assessment._id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <EyeIcon className="w-5 h-5" />
                      <span>View Results</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comparison Charts */}
      {comparisonData && completedCount >= 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Progress Comparison
            </h2>
            <p className="text-gray-600">
              See how your scores have changed over time
            </p>
          </div>

          {/* RIASEC Progress */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              RIASEC Personality Progress
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={comparisonData.riasecComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="attempt"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="realistic"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Realistic"
                />
                <Line
                  type="monotone"
                  dataKey="investigative"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Investigative"
                />
                <Line
                  type="monotone"
                  dataKey="artistic"
                  stroke="#a855f7"
                  strokeWidth={2}
                  name="Artistic"
                />
                <Line
                  type="monotone"
                  dataKey="social"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Social"
                />
                <Line
                  type="monotone"
                  dataKey="enterprising"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Enterprising"
                />
                <Line
                  type="monotone"
                  dataKey="conventional"
                  stroke="#6366f1"
                  strokeWidth={2}
                  name="Conventional"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Aptitude Progress */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Aptitude Skills Progress
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={comparisonData.aptitudeComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="attempt"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="logical"
                  stroke="#ec4899"
                  strokeWidth={2}
                  name="Logical"
                />
                <Line
                  type="monotone"
                  dataKey="numerical"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Numerical"
                />
                <Line
                  type="monotone"
                  dataKey="verbal"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Verbal"
                />
                <Line
                  type="monotone"
                  dataKey="spatial"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Spatial"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Latest vs Previous Radar */}
          {comparisonData.radarData && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Latest vs Previous Assessment
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={comparisonData.radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                  />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Previous"
                    dataKey="previous"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.4}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {comparisonData && completedCount === 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <ChartBarIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Complete another assessment to see your progress
          </h3>
          <p className="text-blue-700 mb-4">
            Take the assessment again to compare your results and track your
            growth over time
          </p>
          <button
            onClick={handleRetakeAssessment}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Take Another Assessment
          </button>
        </div>
      )}
    </div>
  );
};

export default AssessmentHistory;
