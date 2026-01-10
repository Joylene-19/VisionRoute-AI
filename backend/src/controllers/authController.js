import User from "../models/User.js";
import { generateToken } from "../middleware/authMiddleware.js";
import { ErrorResponse } from "../middleware/errorHandler.js";

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, currentGrade } = req.body;

    // Validation
    if (!name || !email || !password) {
      return next(
        new ErrorResponse("Please provide name, email, and password", 400)
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse("Email already registered", 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      currentGrade,
      authProvider: "email",
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: user.getSafeUser(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return next(new ErrorResponse("Please provide email and password", 400));
    }

    // Find user (include password for comparison)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check if account is active
    if (!user.isActive) {
      return next(new ErrorResponse("Your account has been deactivated", 401));
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: user.getSafeUser(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Google OAuth login/register
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleAuth = async (req, res, next) => {
  try {
    const { firebaseUid, email, name, profilePhoto } = req.body;

    if (!firebaseUid || !email) {
      return next(new ErrorResponse("Invalid Google authentication data", 400));
    }

    // Find or create user
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      // Check if email exists with different auth provider
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return next(
          new ErrorResponse(
            "An account with this email already exists. Please login with email/password.",
            400
          )
        );
      }

      // Create new user
      user = await User.create({
        name,
        email,
        firebaseUid,
        authProvider: "google",
        isEmailVerified: true,
        profilePhoto: profilePhoto || undefined,
      });
    } else {
      // Update last login
      await user.updateLastLogin();
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message:
        user.loginCount === 1
          ? "Account created successfully"
          : "Login successful",
      token,
      user: user.getSafeUser(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: user.getSafeUser(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      dateOfBirth,
      gender,
      currentGrade,
      school,
      city,
      state,
      profilePhoto,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // Update fields (only if provided)
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (currentGrade) user.currentGrade = currentGrade;
    if (school) user.school = school;
    if (city) user.city = city;
    if (state) user.state = state;
    if (profilePhoto) user.profilePhoto = profilePhoto;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: user.getSafeUser(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(
        new ErrorResponse(
          "Please provide current password and new password",
          400
        )
      );
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // Check if user uses email auth (not Google OAuth)
    if (user.authProvider !== "email") {
      return next(
        new ErrorResponse(
          "Password change is only available for email/password accounts",
          400
        )
      );
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return next(new ErrorResponse("Current password is incorrect", 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

/**
 * @desc    Request password reset (generates reset token)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ErrorResponse("Please provide an email", 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a reset link has been sent",
      });
    }

    // Check if user uses email auth (not Google OAuth)
    if (user.authProvider !== "email") {
      return next(
        new ErrorResponse(
          "Password reset is only available for email/password accounts. Please use Google Sign-In.",
          400
        )
      );
    }

    // Generate reset token (simple 6-digit code for now)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the token before saving
    const crypto = await import("crypto");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save hashed token and expiry (10 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // In production, send email with resetToken
    // For now, return it in response (ONLY FOR DEVELOPMENT)
    res.status(200).json({
      success: true,
      message: "Password reset code generated",
      resetToken, // Remove this in production, send via email instead
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return next(
        new ErrorResponse(
          "Please provide email, reset code, and new password",
          400
        )
      );
    }

    // Hash the provided token to compare with stored hash
    const crypto = await import("crypto");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return next(new ErrorResponse("Invalid or expired reset code", 400));
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    next(error);
  }
};
