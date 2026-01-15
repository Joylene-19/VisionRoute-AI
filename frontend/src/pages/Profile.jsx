import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  School,
  Calendar,
  Edit2,
  Save,
  X,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { updateUserProfile } from "../services/authService";
import { GRADE_OPTIONS, GENDER_OPTIONS } from "../utils/constants";
import { getInitials } from "../utils/helpers";

// Validation schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone must be 10 digits")
    .optional()
    .or(z.literal("")),
  currentGrade: z.string().optional(),
  gender: z.string().optional(),
  school: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      currentGrade: user?.currentGrade || "",
      gender: user?.gender || "",
      school: user?.school || "",
      city: user?.city || "",
      state: user?.state || "",
      dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        phone: user.phone || "",
        currentGrade: user.currentGrade || "",
        gender: user.gender || "",
        school: user.school || "",
        city: user.city || "",
        state: user.state || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      const response = await updateUserProfile(data);

      if (response.success) {
        updateUser(response.user);
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error || "Failed to update profile");
    }
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    reset({
      name: user.name || "",
      phone: user.phone || "",
      currentGrade: user.currentGrade || "",
      gender: user.gender || "",
      school: user.school || "",
      city: user.city || "",
      state: user.state || "",
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-text-primary dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-text-secondary dark:text-gray-300">
            Manage your account information
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card text-center lg:col-span-1"
          >
            {/* Profile Photo */}
            <div className="mb-4">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary/20"
                />
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto bg-gradient-primary flex items-center justify-center text-white text-4xl font-bold">
                  {getInitials(user?.name)}
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-1">
              {user?.name}
            </h2>
            <p className="text-text-secondary dark:text-gray-300 mb-4">
              {user?.email}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border dark:border-gray-700">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {user?.completedAssessments || 0}
                </div>
                <div className="text-sm text-text-secondary dark:text-gray-400">
                  Assessments
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">
                  {user?.loginCount || 0}
                </div>
                <div className="text-sm text-text-secondary dark:text-gray-400">
                  Logins
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div className="mt-6 pt-6 border-t border-border dark:border-gray-700">
              <div className="text-sm text-text-secondary dark:text-gray-400">
                Member since
              </div>
              <div className="text-text-primary dark:text-white font-medium">
                {new Date(user?.createdAt).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card lg:col-span-2"
          >
            {/* Header with Edit Button */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-text-primary dark:text-white">
                Personal Information
              </h3>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn btn-secondary px-4 py-2 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn btn-secondary px-4 py-2 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    {...register("name")}
                    type="text"
                    disabled={!isEditing}
                    className={`input pl-11 ${
                      !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-error">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="input pl-11 bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  Email cannot be changed
                </p>
              </div>

              {/* Phone & Gender Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input
                      {...register("phone")}
                      type="tel"
                      disabled={!isEditing}
                      className={`input pl-11 ${
                        !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                      }`}
                      placeholder="1234567890"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-error">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Gender
                  </label>
                  <select
                    {...register("gender")}
                    disabled={!isEditing}
                    className={`input ${
                      !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date of Birth & Current Grade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input
                      {...register("dateOfBirth")}
                      type="date"
                      disabled={!isEditing}
                      className={`input pl-11 ${
                        !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Current Grade
                  </label>
                  <select
                    {...register("currentGrade")}
                    disabled={!isEditing}
                    className={`input ${
                      !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">Select grade</option>
                    {GRADE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* School */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  School/College
                </label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    {...register("school")}
                    type="text"
                    disabled={!isEditing}
                    className={`input pl-11 ${
                      !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                    placeholder="Your school or college name"
                  />
                </div>
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input
                      {...register("city")}
                      type="text"
                      disabled={!isEditing}
                      className={`input pl-11 ${
                        !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                      }`}
                      placeholder="Your city"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    State
                  </label>
                  <input
                    {...register("state")}
                    type="text"
                    disabled={!isEditing}
                    className={`input ${
                      !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                    placeholder="Your state"
                  />
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-gradient w-full py-3 text-base font-semibold"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
