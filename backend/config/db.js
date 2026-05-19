import mongoose from "mongoose";

// Connect to MongoDB database using try catch block
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("Error connecting to MongoDB: MONGO_URI is not configured");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connection to MongoDB successful");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
