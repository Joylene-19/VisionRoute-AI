import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithPopup } from "firebase/auth";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  GraduationCap,
} from "lucide-react";
import { auth, googleProvider } from "../firebase";
import { registerUser, googleLogin } from "../services/authService";
import useAuthStore from "../store/authStore";
import { GRADE_OPTIONS } from "../utils/constants";

// Validation schema
const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name too long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, "Phone must be 10 digits")
      .optional()
      .or(z.literal("")),
    currentGrade: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const Register = () => {
  const navigate = useNavigate();
  const { setAuth, setLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  // Email/Password Registration
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const { confirmPassword, ...registrationData } = data;

      const response = await registerUser(registrationData);

      if (response.success) {
        setAuth(response.user, response.token);
        toast.success(response.message || "Registration successful!");
        navigate("/");
      }
    } catch (error) {
      toast.error(error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Registration
  const handleGoogleSignup = async () => {
    try {
      setIsGoogleLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const response = await googleLogin({
        firebaseUid: user.uid,
        email: user.email,
        name: user.displayName,
        profilePhoto: user.photoURL,
      });

      if (response.success) {
        setAuth(response.user, response.token);
        toast.success(response.message || "Account created successfully!");
        navigate("/");
      }
    } catch (error) {
      console.error("Google signup error:", error);
      toast.error("Google signup failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-background to-primary/10 dark:from-gray-900 dark:via-dark-background dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block"
          >
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Create Account
          </h1>
          <p className="text-text-secondary">
            Start your journey to discover your ideal stream
          </p>
        </div>

        {/* Registration Form Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
        >
          {/* Google Sign Up Button (Top) */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading}
            className="btn btn-secondary w-full py-3 text-base font-medium flex items-center justify-center gap-3 mb-6"
          >
            {isGoogleLoading ? (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-surface text-text-secondary">
                Or register with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Input */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Full Name <span className="text-error">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  {...register("name")}
                  type="text"
                  id="name"
                  placeholder="John Doe"
                  className={`input pl-11 ${
                    errors.name ? "border-error focus:ring-error" : ""
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-error">{errors.name.message}</p>
              )}
            </div>

            {/* Email & Phone (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Email <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    {...register("email")}
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    className={`input pl-11 ${
                      errors.email ? "border-error focus:ring-error" : ""
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-error">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    {...register("phone")}
                    type="tel"
                    id="phone"
                    placeholder="1234567890"
                    className={`input pl-11 ${
                      errors.phone ? "border-error focus:ring-error" : ""
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-error">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Current Grade */}
            <div>
              <label
                htmlFor="currentGrade"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Current Grade (Optional)
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <select
                  {...register("currentGrade")}
                  id="currentGrade"
                  className="input pl-11"
                >
                  <option value="">Select your grade</option>
                  {GRADE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password & Confirm Password (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Password <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Min. 6 characters"
                    className={`input pl-11 pr-11 ${
                      errors.password ? "border-error focus:ring-error" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-error">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Confirm Password <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="Repeat password"
                    className={`input pl-11 pr-11 ${
                      errors.confirmPassword
                        ? "border-error focus:ring-error"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-error">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 mt-1 rounded border-border text-primary focus:ring-2 focus:ring-primary"
              />
              <label
                htmlFor="terms"
                className="ml-2 text-sm text-text-secondary"
              >
                I agree to the{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-gradient w-full py-3 text-base font-semibold"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:text-primary-dark font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
