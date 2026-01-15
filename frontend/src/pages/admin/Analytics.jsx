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
  CalendarIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30"); // days
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssessments: 0,
    completedAssessments: 0,
    activeUsers: 0,
  });
  const [chartsData, setChartsData] = useState({
    userGrowth: [],
    assessmentStatus: [],
    topCareers: [],
    riasecDistribution: [],
    aptitudeAverages: [],
  });

  useEffect(() => {
    fetchAnalytics();
    fetchChartsData();
  }, [dateRange]);

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

  const fetchChartsData = async () => {
    try {
      const response = await api.get(`/api/admin/analytics?days=${dateRange}`);

      if (response.success) {
        setChartsData(response.data);
      }
    } catch (error) {
      console.error("Failed to load charts data:", error);
      // Set default mock data if API fails
      setChartsData(getMockChartsData());
    }
  };

  const getMockChartsData = () => {
    // Generate mock data for development
    const days = parseInt(dateRange);
    const userGrowth = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      userGrowth.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        users: Math.floor(Math.random() * 10) + 1,
        assessments: Math.floor(Math.random() * 15) + 1,
      });
    }

    return {
      userGrowth,
      assessmentStatus: [
        {
          name: "Completed",
          value: stats.completedAssessments || 15,
          color: "#10b981",
        },
        {
          name: "In Progress",
          value: stats.totalAssessments - stats.completedAssessments || 8,
          color: "#f59e0b",
        },
        {
          name: "Not Started",
          value: Math.max(0, stats.totalUsers - stats.totalAssessments) || 3,
          color: "#6b7280",
        },
      ],
      topCareers: [
        { career: "Software Engineer", count: 12 },
        { career: "Data Scientist", count: 10 },
        { career: "Product Manager", count: 8 },
        { career: "UX Designer", count: 7 },
        { career: "Business Analyst", count: 6 },
      ],
      riasecDistribution: [
        { dimension: "Realistic", average: 65 },
        { dimension: "Investigative", average: 72 },
        { dimension: "Artistic", average: 58 },
        { dimension: "Social", average: 68 },
        { dimension: "Enterprising", average: 75 },
        { dimension: "Conventional", average: 62 },
      ],
      aptitudeAverages: [
        { skill: "Logical", average: 68 },
        { skill: "Numerical", average: 65 },
        { skill: "Verbal", average: 72 },
        { skill: "Spatial", average: 58 },
      ],
    };
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
      {/* Header with Date Range Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights and metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-gray-500" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            User Growth & Activity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartsData.userGrowth}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="colorAssessments"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 12 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#colorUsers)"
                name="New Users"
              />
              <Area
                type="monotone"
                dataKey="assessments"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorAssessments)"
                name="Assessments"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Assessment Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Assessment Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartsData.assessmentStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartsData.assessmentStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Career Matches */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Top Career Matches
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartsData.topCareers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 12 }} />
              <YAxis
                dataKey="career"
                type="category"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="count"
                fill="#10b981"
                name="Matches"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* RIASEC Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            RIASEC Score Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartsData.riasecDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="dimension"
                tick={{ fill: "#6b7280", fontSize: 11 }}
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
              <Bar
                dataKey="average"
                fill="#6366f1"
                name="Average Score"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Aptitude Averages */}
        <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Average Aptitude Scores
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartsData.aptitudeAverages}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="skill" tick={{ fill: "#6b7280", fontSize: 12 }} />
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
              <Bar
                dataKey="average"
                fill="#8b5cf6"
                name="Average Score"
                radius={[8, 8, 0, 0]}
              >
                {chartsData.aptitudeAverages.map((entry, index) => {
                  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981"];
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
