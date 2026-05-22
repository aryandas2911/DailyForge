import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Connect to MongoDB database using try catch block
const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // Check if URI is the default template or invalid
    if (!uri || uri === "your_mongodb_atlas_connection_string" || (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://"))) {
      console.log("No valid MONGO_URI found in .env. Starting in-memory MongoDB instance for local development...");
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }

    await mongoose.connect(uri);
    console.log("Connection to MongoDB successful");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
