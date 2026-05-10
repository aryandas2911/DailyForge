import mongoose from "mongoose";

// Connect to MongoDB database using try catch block
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connection to MongoDB successful");
  } catch (_error) {
    console.log("Error connecting to MongoDB");
  }
};

export default connectDB;
