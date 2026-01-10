import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: function () {
        // Password required only if not using OAuth
        return !this.authProvider || this.authProvider === "email";
      },
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },

    // Profile Information
    profilePhoto: {
      type: String,
      default:
        "https://res.cloudinary.com/demo/image/upload/v1/avatar-placeholder.png",
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },

    // Educational Information
    currentGrade: {
      type: String,
      enum: ["9th", "10th", "11th", "12th", "College", "Graduate", "Other"],
    },
    school: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },

    // Authentication
    authProvider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },
    firebaseUid: {
      type: String,
      sparse: true, // Allow null but must be unique if provided
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpire: {
      type: Date,
      select: false,
    },

    // Password Reset
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },

    // Role & Access
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Assessment History
    assessments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assessment",
      },
    ],
    completedAssessments: {
      type: Number,
      default: 0,
    },

    // Activity Tracking
    lastLogin: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// ============================================
// MIDDLEWARE - Hash password before saving
// ============================================
userSchema.pre("save", async function (next) {
  // Only hash if password is modified or new
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ============================================
// METHODS
// ============================================

/**
 * Compare entered password with hashed password
 * @param {string} enteredPassword - Plain text password
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Get safe user object (without sensitive fields)
 * @returns {Object}
 */
userSchema.methods.getSafeUser = function () {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpire;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  return user;
};

/**
 * Update last login
 */
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = Date.now();
  this.loginCount += 1;
  await this.save({ validateBeforeSave: false });
};

// ============================================
// INDEXES for better query performance
// ============================================
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true });
userSchema.index({ createdAt: -1 });

const User = mongoose.model("User", userSchema);

export default User;
