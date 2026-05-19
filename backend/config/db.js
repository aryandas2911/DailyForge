import mongoose from "mongoose";

// Connect to MongoDB database using try catch block
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connection to MongoDB successful");
  } catch (error) {
<<<<<<< HEAD
    console.log("Error connecting to MongoDB:", error.message);
=======
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
>>>>>>> upstream/main
  }
};

export default connectDB;
