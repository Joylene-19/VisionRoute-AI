import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

/**
 * Initialize Firebase Admin SDK
 * Use service account credentials from environment variables
 */
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      console.log(" Firebase Admin already initialized");
      return admin.app();
    }

    // Parse the private key (handle escaped newlines)
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined;

    // Initialize with service account credentials
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });

    console.log(" Firebase Admin initialized successfully");
    return app;
  } catch (error) {
    console.error(" Firebase initialization error:", error.message);
    // Don't exit - allow app to run without Firebase (for local dev)
    console.warn("  Continuing without Firebase Admin...");
    return null;
  }
};

// Initialize Firebase
const firebaseApp = initializeFirebase();

// Export Firebase Admin modules
export const auth = admin.auth;
export const firestore = admin.firestore;
export default firebaseApp;
