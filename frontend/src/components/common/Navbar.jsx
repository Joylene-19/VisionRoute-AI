import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LogOut,
  User,
  Home as HomeIcon,
  ShieldCheck,
  LayoutDashboard,
  Clock as ClockIcon,
  Bookmark as BookmarkIcon,
  LightbulbIcon,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";
import DarkModeToggle from "./DarkModeToggle";
import NotificationCenter from "./NotificationCenter";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="bg-surface dark:bg-dark-surface border-b border-border dark:border-dark-border sticky top-0 z-50 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <HomeIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary">
              VisionRoute AI
            </span>
          </Link>

          {/* Nav Items */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle - Always visible */}
            <DarkModeToggle />

            {isAuthenticated ? (
              <>
                {/* Dashboard Link */}
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-background transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5 text-text-secondary" />
                  <span className="text-sm font-medium text-text-primary hidden sm:inline">
                    Dashboard
                  </span>
                </Link>

                {/* Assessment History Link */}
                <Link
                  to="/history"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-background transition-colors"
                >
                  <ClockIcon className="w-5 h-5 text-text-secondary" />
                  <span className="text-sm font-medium text-text-primary hidden sm:inline">
                    History
                  </span>
                </Link>

                {/* Bookmarks Link */}
                <Link
                  to="/bookmarks"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-background transition-colors"
                >
                  <BookmarkIcon className="w-5 h-5 text-text-secondary" />
                  <span className="text-sm font-medium text-text-primary hidden sm:inline">
                    Bookmarks
                  </span>
                </Link>

                {/* Opportunity Analyzer Link */}
                <Link
                  to="/opportunity-analyzer"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-background transition-colors bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700"
                >
                  <LightbulbIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300 hidden sm:inline">
                    Opportunities
                  </span>
                </Link>

                {/* Notification Center */}
                <NotificationCenter />

                {/* Admin Panel Link - Only show for admin users */}
                {user?.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">
                      Admin Panel
                    </span>
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-background transition-colors"
                >
                  <User className="w-5 h-5 text-text-secondary" />
                  <span className="text-sm font-medium text-text-primary hidden sm:inline">
                    {user?.name || "Profile"}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">
                    Logout
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary px-6 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary px-6 py-2">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
