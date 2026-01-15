import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useAuthStore from "../store/authStore";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  TrendingUp,
  Award,
  Clock,
  Target,
  BookOpen,
  MessageSquare,
  FileText,
  ArrowRight,
  CheckCircle,
  Calendar,
  Users,
} from "lucide-react";

const UserDashboard = () => {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/user/dashboard");
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    assessmentsCompleted: 0,
    careerMatches: 0,
    timeSpent: "0h",
    profileStrength: 0,
  };

  const recentActivity = dashboardData?.recentActivity || [];
  const recommendedCareers = dashboardData?.recommendedCareers || [];
  const quoteOfDay =
    dashboardData?.quoteOfDay || "Your career journey starts today!";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-2xl p-8 text-white shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 mb-6 md:mb-0">
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user?.displayName || user?.name}! 👋
              </h1>
              <p className="text-indigo-100 text-lg italic mb-4">
                "{quoteOfDay}"
              </p>

              {/* Profile Completion */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Profile Completion
                  </span>
                  <span className="text-sm font-bold">
                    {stats.profileStrength}%
                  </span>
                </div>
                <div className="w-full bg-indigo-400 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.profileStrength}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-white h-3 rounded-full shadow-lg"
                  />
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col gap-3 md:ml-8">
              <Link
                to="/assessment"
                className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Target className="w-5 h-5" />
                Start Assessment
              </Link>
              {stats.assessmentsCompleted > 0 && (
                <Link
                  to="/results"
                  className="bg-indigo-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-400 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  View Results
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={Award}
            title="Assessments"
            value={stats.assessmentsCompleted}
            color="blue"
            delay={0.1}
          />
          <StatsCard
            icon={TrendingUp}
            title="Career Matches"
            value={stats.careerMatches}
            color="purple"
            delay={0.2}
          />
          <StatsCard
            icon={Clock}
            title="Time Spent"
            value={stats.timeSpent}
            color="green"
            delay={0.3}
          />
          <StatsCard
            icon={Target}
            title="Profile Score"
            value={`${stats.profileStrength}%`}
            color="orange"
            delay={0.4}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-white dark:bg-dark-surface rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Recent Activity
              </h2>
              <Calendar className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>

            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  No activity yet. Start your assessment!
                </p>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <QuickActionButton
                to="/assessment"
                icon={Target}
                label="Take Assessment"
                color="indigo"
              />
              <QuickActionButton
                to="/results"
                icon={FileText}
                label="View Results"
                color="purple"
              />
              <QuickActionButton
                to="/ai-chat"
                icon={MessageSquare}
                label="AI Career Chat"
                color="green"
                badge="New"
              />
              <QuickActionButton
                to="/profile"
                icon={Users}
                label="Edit Profile"
                color="blue"
              />
            </div>
          </motion.div>
        </div>

        {/* Recommended Careers */}
        {recommendedCareers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Recommended Careers for You
              </h2>
              <Link
                to="/results"
                className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedCareers.slice(0, 3).map((career, index) => (
                <CareerCard key={index} career={career} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, color, delay }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">
            {value}
          </p>
        </div>
        <div
          className={`bg-gradient-to-br ${colorClasses[color]} p-3 rounded-xl`}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

// Activity Item Component
const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "assessment":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "career_view":
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case "profile_update":
        return <Users className="w-5 h-5 text-purple-500" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="mt-1">{getActivityIcon(activity.type)}</div>
      <div className="flex-1">
        <p className="font-medium text-gray-800 dark:text-white">
          {activity.title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(activity.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ to, icon: Icon, label, color, badge }) => {
  const colorClasses = {
    indigo:
      "hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    purple:
      "hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    blue: "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green:
      "hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400",
  };

  return (
    <Link
      to={to}
      className={`flex items-center justify-between p-4 rounded-lg border-2 border-gray-100 dark:border-gray-700 ${colorClasses[color]} transition-all group`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
            {badge}
          </span>
        )}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};

// Career Card Component
const CareerCard = ({ career }) => {
  return (
    <div className="border-2 border-gray-100 dark:border-gray-700 rounded-xl p-5 hover:border-indigo-200 dark:hover:border-indigo-600 hover:shadow-lg transition-all group bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {career.title}
        </h3>
        <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-sm font-bold px-3 py-1 rounded-full">
          {career.match}%
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
        {career.description}
      </p>
      <button className="text-indigo-600 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
        Learn More
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default UserDashboard;
