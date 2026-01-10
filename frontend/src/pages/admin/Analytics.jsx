import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  UsersIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssessments: 0,
    completedAssessments: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/dashboard/stats");

      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      toast.error("Failed to load analytics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletionRate = () => {
    if (stats.totalAssessments === 0) return 0;
    return (
      (stats.completedAssessments / stats.totalAssessments) *
      100
    ).toFixed(1);
  };

  const calculateAverageAssessments = () => {
    if (stats.totalUsers === 0) return 0;
    return (stats.totalAssessments / stats.totalUsers).toFixed(1);
  };

  const metricCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: UsersIcon,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Total Assessments",
      value: stats.totalAssessments,
      icon: DocumentTextIcon,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200",
    },
    {
      title: "Completed Assessments",
      value: stats.completedAssessments,
      icon: CheckCircleIcon,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
    },
    {
      title: "Active Users (7 days)",
      value: stats.activeUsers,
      icon: UserGroupIcon,
      color: "orange",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      borderColor: "border-orange-200",
    },
  ];

  const insights = [
    {
      title: "Completion Rate",
      value: `${calculateCompletionRate()}%`,
      description: "of started assessments are completed",
      icon: CheckCircleIcon,
      color: "green",
    },
    {
      title: "Avg Assessments/User",
      value: calculateAverageAssessments(),
      description: "assessments per registered user",
      icon: ArrowTrendingUpIcon,
      color: "blue",
    },
    {
      title: "User Engagement",
      value:
        stats.totalUsers > 0
          ? `${((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%`
          : "0%",
      description: "of users active in last 7 days",
      icon: UserGroupIcon,
      color: "purple",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${metric.borderColor}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {metric.value}
                  </p>
                </div>
                <div className={`${metric.bgColor} p-3 rounded-full`}>
                  <Icon className={`w-8 h-8 ${metric.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight) => {
          const Icon = insight.icon;
          const colorClasses = {
            green: {
              bg: "bg-green-50",
              icon: "text-green-600",
              text: "text-green-800",
            },
            blue: {
              bg: "bg-blue-50",
              icon: "text-blue-600",
              text: "text-blue-800",
            },
            purple: {
              bg: "bg-purple-50",
              icon: "text-purple-600",
              text: "text-purple-800",
            },
          };
          const colors = colorClasses[insight.color];

          return (
            <div
              key={insight.title}
              className={`${colors.bg} rounded-lg p-6 border border-gray-200`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Icon className={`w-8 h-8 ${colors.icon}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {insight.title}
                  </p>
                  <p className={`text-2xl font-bold ${colors.text} mt-1`}>
                    {insight.value}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <UserGroupIcon className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              User Activity Summary
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">
                Total Registered Users
              </span>
              <span className="text-lg font-semibold text-gray-800">
                {stats.totalUsers}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">
                Active Users (7 days)
              </span>
              <span className="text-lg font-semibold text-green-600">
                {stats.activeUsers}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Inactive Users</span>
              <span className="text-lg font-semibold text-gray-500">
                {stats.totalUsers - stats.activeUsers}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-600">Activation Rate</span>
              <span className="text-lg font-semibold text-blue-600">
                {stats.totalUsers > 0
                  ? `${((stats.activeUsers / stats.totalUsers) * 100).toFixed(
                      1
                    )}%`
                  : "0%"}
              </span>
            </div>
          </div>
        </div>

        {/* Assessment Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DocumentTextIcon className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Assessment Summary
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total Assessments</span>
              <span className="text-lg font-semibold text-gray-800">
                {stats.totalAssessments}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-lg font-semibold text-green-600">
                {stats.completedAssessments}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="text-lg font-semibold text-yellow-600">
                {stats.totalAssessments - stats.completedAssessments}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="text-lg font-semibold text-blue-600">
                {calculateCompletionRate()}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Health */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Platform Health Score</h3>
            <p className="text-indigo-100 text-sm">
              Based on user engagement and assessment completion
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">
              {Math.round(
                (parseFloat(calculateCompletionRate()) +
                  (stats.totalUsers > 0
                    ? (stats.activeUsers / stats.totalUsers) * 100
                    : 0)) /
                  2
              )}
            </div>
            <p className="text-sm text-indigo-100 mt-1">out of 100</p>
          </div>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-3">
          <div
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{
              width: `${Math.round(
                (parseFloat(calculateCompletionRate()) +
                  (stats.totalUsers > 0
                    ? (stats.activeUsers / stats.totalUsers) * 100
                    : 0)) /
                  2
              )}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
