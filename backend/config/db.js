import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Connect to MongoDB database using try catch block
const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    
    // Automatically use in-memory database if no valid URI is provided
    if (!uri || uri === "your_mongodb_atlas_connection_string" || uri.includes("localhost:27017")) {
       console.log("No remote MongoDB URI provided. Starting local in-memory MongoDB server...");
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
