import mongoose from "mongoose";

// Connect to MongoDB database using try catch block
const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    
    // If MONGO_URI is empty/undefined, skip connection (test mode)
    if (!MONGO_URI || MONGO_URI.trim() === "") {
      console.log("⚠️  MONGO_URI not configured - skipping database connection");
      return;
    }

    await mongoose.connect(MONGO_URI);
    console.log("Connection to MongoDB successful");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
