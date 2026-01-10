import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { auth as firebaseAuth } from "../config/firebase.js";

/**
 * Protect routes - Verify JWT token
 * Usage: Add this middleware to protected routes
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header (Bearer token)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route. No token provided.",
      });
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database (exclude password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User no longer exists",
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Your account has been deactivated",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    });
  }
};

/**
 * Admin access middleware - Restrict to admin role
 * Usage: Add after protect middleware on admin-only routes
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
};

/**
 * Verify Firebase ID token (for Google OAuth)
 * Usage: Use this for routes that accept Firebase tokens
 */
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const firebaseToken = req.headers.authorization?.split("Bearer ")[1];

    if (!firebaseToken) {
      return res.status(401).json({
        success: false,
        message: "No Firebase token provided",
      });
    }

    // Verify Firebase token
    const decodedToken = await firebaseAuth().verifyIdToken(firebaseToken);

    // Find or create user
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      // Create user from Firebase data
      user = await User.create({
        name: decodedToken.name || "User",
        email: decodedToken.email,
        firebaseUid: decodedToken.uid,
        authProvider: "google",
        isEmailVerified: decodedToken.email_verified || false,
        profilePhoto: decodedToken.picture || undefined,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid Firebase token",
      error: error.message,
    });
  }
};

/**
 * Grant access to specific roles
 * Usage: protect, authorize('admin', 'moderator')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};
