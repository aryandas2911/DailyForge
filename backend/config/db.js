import mongoose from "mongoose";

// Connect to MongoDB database using try/catch block
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is not set in environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connection to MongoDB successful");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    console.error(
      "Check that your Atlas IP whitelist allows this machine and that DNS/SRV resolution is available."
    );
    process.exit(1);
  }
};

export default connectDB;
