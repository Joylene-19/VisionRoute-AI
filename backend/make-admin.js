import mongoose from "mongoose";
import User from "./src/models/User.js";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("\n🔧 Make User Admin Tool");
    console.log("=".repeat(60));

    // Get all users
    const users = await User.find({}).select("name email role");

    if (users.length === 0) {
      console.log("\n⚠️  No users found. Please register a user first.\n");
      process.exit(0);
    }

    console.log("\n📝 Available Users:\n");
    users.forEach((user, index) => {
      const roleLabel = user.role === "admin" ? "👑 ADMIN" : "👤 USER";
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${roleLabel}`);
    });

    console.log("\n" + "=".repeat(60));

    const userNumber = await question(
      "\nEnter user number to make admin (or 'q' to quit): "
    );

    if (userNumber.toLowerCase() === "q") {
      console.log("\n❌ Cancelled.\n");
      process.exit(0);
    }

    const selectedIndex = parseInt(userNumber) - 1;

    if (selectedIndex < 0 || selectedIndex >= users.length) {
      console.log("\n❌ Invalid user number.\n");
      process.exit(1);
    }

    const selectedUser = users[selectedIndex];

    if (selectedUser.role === "admin") {
      console.log(`\n✅ ${selectedUser.name} is already an admin!\n`);
      process.exit(0);
    }

    // Update user role to admin
    await User.findByIdAndUpdate(selectedUser._id, { role: "admin" });

    console.log(`\n✅ Successfully made ${selectedUser.name} an admin! 👑`);
    console.log(`📧 Email: ${selectedUser.email}`);
    console.log(
      `\nYou can now login with this account to access the admin panel.\n`
    );

    await mongoose.connection.close();
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    rl.close();
    process.exit(1);
  }
}

makeAdmin();
