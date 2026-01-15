import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/common/Navbar";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import UserDashboard from "./pages/UserDashboard";
import Assessment from "./pages/Assessment";
import Results from "./pages/Results";
import ForgotPassword from "./pages/ForgotPassword";
import AssessmentHistory from "./pages/AssessmentHistory";
import Bookmarks from "./pages/Bookmarks";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import QuestionManagement from "./pages/admin/QuestionManagement";
import AssessmentReports from "./pages/admin/AssessmentReports";
import AssessmentDetail from "./pages/admin/AssessmentDetail";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import CareerChatbot from "./pages/CareerChatbot";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#fff",
              color: "#111827",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            },
            success: {
              iconTheme: {
                primary: "#10B981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF4444",
                secondary: "#fff",
              },
            },
          }}
        />

        {/* Navigation */}
        <Navbar />

        {/* Routes */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Assessment Route - Module 2 */}
          <Route
            path="/assessment"
            element={
              <ProtectedRoute>
                <Assessment />
              </ProtectedRoute>
            }
          />

          {/* Results */}
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results/:id"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />

          {/* Assessment History - Module 6 Phase 4 */}
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <AssessmentHistory />
              </ProtectedRoute>
            }
          />

          {/* Bookmarks - Module 6 Phase 4 */}
          <Route
            path="/bookmarks"
            element={
              <ProtectedRoute>
                <Bookmarks />
              </ProtectedRoute>
            }
          />

          {/* AI Career Chatbot - Module 6 Phase 2 */}
          <Route
            path="/ai-chat"
            element={
              <ProtectedRoute>
                <CareerChatbot />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminLayout>
                  <UserManagement />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/questions"
            element={
              <AdminRoute>
                <AdminLayout>
                  <QuestionManagement />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/assessments"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AssessmentReports />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/assessments/:id"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AssessmentDetail />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Analytics />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Settings />
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* Redirect /admin to /admin/dashboard */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          {/* 404 Not Found */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="card text-center max-w-md">
                  <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                  <h2 className="text-2xl font-bold text-text-primary mb-2">
                    Page Not Found
                  </h2>
                  <p className="text-text-secondary mb-6">
                    The page you're looking for doesn't exist.
                  </p>
                  <a href="/" className="btn btn-primary px-6 py-2">
                    Go Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
