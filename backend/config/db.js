import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Connect to MongoDB database using try catch block
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // Fallback to local / memory server if default uri is set
    if (!mongoUri || mongoUri.includes("your_mongodb_atlas") || mongoUri === "mongodb://127.0.0.1:27017/dailyforge") {
      try {
        console.log("Attempting to connect to local MongoDB at 127.0.0.1:27017...");
        await mongoose.connect("mongodb://127.0.0.1:27017/dailyforge", {
          serverSelectionTimeoutMS: 2000
        });
        console.log("Connection to local MongoDB successful");
        return;
      } catch (err) {
        console.log("Local MongoDB server not running. Starting MongoMemoryServer for development...");
        const mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
        console.log(`MongoMemoryServer started at: ${mongoUri}`);
      }
    }

    await mongoose.connect(mongoUri);
    console.log("Connection to MongoDB successful");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
