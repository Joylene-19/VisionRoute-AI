import mongoose from "mongoose";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

console.log("\n🔍 Testing VisionRoute AI Connections...\n");

// Test 1: MongoDB Connection
async function testMongoDB() {
  console.log("1️⃣ Testing MongoDB Connection...");
  console.log(
    "   URI:",
    process.env.MONGODB_URI?.replace(/:[^:@]+@/, ":****@")
  );

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("   ✅ MongoDB Connected Successfully!");
    console.log("   📊 Database:", mongoose.connection.name);
    console.log("   🌐 Host:", mongoose.connection.host);
    await mongoose.connection.close();
    return true;
  } catch (error) {
    console.log("   ❌ MongoDB Connection Failed!");
    console.log("   Error:", error.message);
    return false;
  }
}

// Test 2: Firebase Admin SDK
function testFirebase() {
  console.log("\n2️⃣ Testing Firebase Admin SDK...");
  console.log("   Project ID:", process.env.FIREBASE_PROJECT_ID);
  console.log("   Client Email:", process.env.FIREBASE_CLIENT_EMAIL);

  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined;

    if (!privateKey || privateKey.includes("Your_Firebase_Private_Key_Here")) {
      console.log("   ❌ Firebase Private Key Not Configured!");
      console.log("   Please update FIREBASE_PRIVATE_KEY in .env file");
      return false;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });

    console.log("   ✅ Firebase Admin Initialized Successfully!");
    return true;
  } catch (error) {
    console.log("   ❌ Firebase Initialization Failed!");
    console.log("   Error:", error.message);
    return false;
  }
}

// Test 3: Environment Variables
function testEnvVars() {
  console.log("\n3️⃣ Checking Environment Variables...");

  const required = {
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  };

  let allPresent = true;
  Object.entries(required).forEach(([key, value]) => {
    const status = value ? "✅" : "❌";
    const display = value
      ? value.length > 50
        ? value.substring(0, 47) + "..."
        : value
      : "MISSING";
    console.log(
      `   ${status} ${key}: ${
        key.includes("KEY") || key.includes("SECRET") ? "****" : display
      }`
    );
    if (!value) allPresent = false;
  });

  return allPresent;
}

// Run all tests
async function runTests() {
  const envCheck = testEnvVars();
  const mongoCheck = await testMongoDB();
  const firebaseCheck = testFirebase();

  console.log("\n" + "=".repeat(50));
  console.log("📊 Test Results Summary:");
  console.log("=".repeat(50));
  console.log(`Environment Variables: ${envCheck ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`MongoDB Connection:    ${mongoCheck ? "✅ PASS" : "❌ FAIL"}`);
  console.log(
    `Firebase Admin SDK:    ${firebaseCheck ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log("=".repeat(50));

  if (envCheck && mongoCheck && firebaseCheck) {
    console.log("\n🎉 All connections successful! You can start the server.\n");
  } else {
    console.log(
      "\n⚠️  Please fix the failed connections before starting the server.\n"
    );
  }

  process.exit(0);
}

runTests();
