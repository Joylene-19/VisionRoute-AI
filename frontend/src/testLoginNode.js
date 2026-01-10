import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

console.log("Firebase Config loaded:", {
  apiKey: firebaseConfig.apiKey ? "✓" : "✗",
  authDomain: firebaseConfig.authDomain ? "✓" : "✗",
  projectId: firebaseConfig.projectId ? "✓" : "✗",
});

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testLogin() {
  try {
    console.log("\nAttempting to login...");
    const cred = await signInWithEmailAndPassword(
      auth,
      "test@gmail.com",
      "Test1234"
    );
    console.log("✓ User logged in successfully!");
    console.log("User ID:", cred.user.uid);
    console.log("Email:", cred.user.email);
    process.exit(0);
  } catch (err) {
    console.error("✗ Login failed:", err.message);
    console.error("Error code:", err.code);
    process.exit(1);
  }
}

testLogin();
