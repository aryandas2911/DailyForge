import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Connect to MongoDB database using try catch block
const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // Use in-memory database if connection string is local
    if (uri && uri.includes("127.0.0.1")) {
      console.log("Starting in-memory MongoDB server...");
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log(`In-memory MongoDB started at ${uri}`);
    }

    await mongoose.connect(uri);
    console.log("Connection to MongoDB successful");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
