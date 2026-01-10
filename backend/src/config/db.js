import mongoose from "mongoose";

/**
 * Connect to MongoDB using Mongoose
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 6+ no longer needs these options
      // useNewUrlParser and useUnifiedTopology are now default
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(` MongoDB Connected: ${conn.connection.host}`);
    console.log(` Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(` MongoDB Connection Error: ${error.message}`);
    console.error(
      `  Server will continue running, but database features won't work.`
    );
    console.error(
      ` Fix: Whitelist your IP at https://cloud.mongodb.com/ → Network Access`
    );
    // Don't exit - let server run without DB for development
  }
};

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log(" Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error(` Mongoose connection error: ${err.message}`);
});

mongoose.connection.on("disconnected", () => {
  console.log("  Mongoose disconnected from MongoDB");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Mongoose connection closed due to app termination");
  process.exit(0);
});

export default connectDB;
