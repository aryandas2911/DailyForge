import mongoose from "mongoose";

// Disable command buffering so it fails fast if not connected
mongoose.set("bufferCommands", false);

// Connect to MongoDB database using try catch block
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("CRITICAL: MONGO_URI is not defined in .env file.");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connection to MongoDB successful");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};

export default connectDB;
