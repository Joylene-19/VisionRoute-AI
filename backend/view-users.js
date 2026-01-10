import mongoose from "mongoose";
import User from "./src/models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function viewUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("\n📊 MongoDB Database: visionroute\n");
    console.log("=".repeat(80));

    // Get all users
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    console.log(`👥 Total Users: ${users.length}\n`);

    if (users.length === 0) {
      console.log("⚠️  No users found. Try registering a new user first.\n");
    } else {
      console.log("📝 User List:\n");
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🆔 ID: ${user._id}`);
        console.log(`   📱 Phone: ${user.phone || "Not provided"}`);
        console.log(`   🎓 Grade: ${user.currentGrade || "Not provided"}`);
        console.log(`   🔐 Auth Provider: ${user.authProvider}`);
        console.log(`   ✅ Email Verified: ${user.isEmailVerified}`);
        console.log(
          `   🕒 Created: ${new Date(user.createdAt).toLocaleString()}`
        );
        console.log(
          `   🔄 Last Login: ${
            user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"
          }`
        );
        console.log(`   📊 Login Count: ${user.loginCount}`);
        console.log("   " + "-".repeat(76));
      });
    }

    console.log("\n" + "=".repeat(80));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

viewUsers();
