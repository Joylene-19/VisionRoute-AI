import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp, Users } from "lucide-react";
import useAuthStore from "../store/authStore";

const Home = () => {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 dark:from-gray-900 dark:via-dark-background dark:to-gray-800">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Welcome Message */}
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-2xl text-text-secondary dark:text-gray-400">
                Welcome back,{" "}
                <span className="text-primary font-semibold">
                  {user?.name}!
                </span>
              </h2>
            </motion.div>
          )}

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary dark:text-white mb-6">
            Discover Your
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {" "}
              Ideal Stream
            </span>
          </h1>

          <p className="text-xl text-text-secondary dark:text-gray-300 max-w-3xl mx-auto mb-12">
            AI-powered career guidance platform that helps students make
            informed decisions about their academic streams through personalized
            assessments and insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <>
                <Link
                  to="/assessment"
                  className="btn btn-gradient px-8 py-4 text-lg font-semibold flex items-center gap-2"
                >
                  Start Assessment
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/results"
                  className="btn btn-secondary px-8 py-4 text-lg font-semibold"
                >
                  View Results
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn btn-gradient px-8 py-4 text-lg font-semibold flex items-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="btn btn-secondary px-8 py-4 text-lg font-semibold"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
        >
          {/* Feature 1 */}
          <div className="card-hover text-center">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary dark:text-white mb-2">
              AI-Powered Analysis
            </h3>
            <p className="text-text-secondary dark:text-gray-400">
              Get personalized stream recommendations using advanced AI
              algorithms
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card-hover text-center">
            <div className="w-14 h-14 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-7 h-7 text-success" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary dark:text-white mb-2">
              Career Insights
            </h3>
            <p className="text-text-secondary dark:text-gray-400">
              Discover top career paths matched to your interests and aptitude
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card-hover text-center">
            <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary dark:text-white mb-2">
              Expert Guidance
            </h3>
            <p className="text-text-secondary dark:text-gray-400">
              Receive detailed roadmaps and resources tailored to your goals
            </p>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">10K+</div>
            <div className="text-text-secondary dark:text-gray-400">
              Students Guided
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-success mb-2">95%</div>
            <div className="text-text-secondary dark:text-gray-400">
              Accuracy Rate
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-secondary mb-2">500+</div>
            <div className="text-text-secondary dark:text-gray-400">
              Career Paths
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-accent-orange mb-2">
              100%
            </div>
            <div className="text-text-secondary dark:text-gray-400">
              Free Forever
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
