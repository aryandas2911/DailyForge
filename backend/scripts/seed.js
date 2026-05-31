import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../src/models/User.js";
import Task from "../src/models/Task.js";
import Routine from "../src/models/Routine.js";

dotenv.config();

const DEMO_EMAIL = "demo@dailyforge.dev";
const DEMO_PASSWORD = "DemoPassword123!";

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    
    // If MONGO_URI is empty/undefined, skip connection
    if (!MONGO_URI || MONGO_URI.trim() === "") {
      console.log("\n⚠️  MONGO_URI not configured - skipping database connection");
      console.log("📝 Database connection is optional. Running in test mode...\n");
      return null;
    }

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connection to MongoDB successful");
    return mongoose.connection;
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

const displayDemoCredentials = () => {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║           🚀 DAILYFORGE - DEMO MODE READY 🚀              ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");
  
  console.log("📌 Demo credentials for testing (development only):\n");
  console.log("   Email:    demo@dailyforge.dev");
  console.log("   Password: DemoPassword123!\n");
  
  console.log("🎯 How to use:\n");
  console.log("   1. Start the backend:  npm run dev");
  console.log("   2. Start the frontend: npm run dev (in new terminal)");
  console.log("   3. Navigate to:        http://localhost:5173");
  console.log("   4. Login with demo credentials above\n");
  
  console.log("⚠️  IMPORTANT:\n");
  console.log("   - Demo mode only works in DEVELOPMENT (NODE_ENV=development)");
  console.log("   - Demo credentials are BLOCKED in production");
  console.log("   - No database required - test without MongoDB!\n");
  
  console.log("💾 To enable database:\n");
  console.log("   1. Set MONGO_URI in .env with MongoDB Atlas connection string");
  console.log("   2. Re-run: npm run seed (will create demo user in DB)\n");
};

const seedDatabase = async () => {
  try {
    const connection = await connectDB();
    
    // If no database connection, just display credentials
    if (!connection) {
      displayDemoCredentials();
      return;
    }

    console.log("\n📝 Seeding database with demo data...\n");

    // Clear existing demo data
    await User.deleteMany({ email: DEMO_EMAIL });
    await Task.deleteMany();
    await Routine.deleteMany();
    console.log("✓ Cleared existing demo data");

    // Create demo user
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    const demoUser = await User.create({
      name: "Demo User",
      email: DEMO_EMAIL,
      password: hashedPassword,
    });
    console.log("✓ Created demo user");

    // Create sample tasks using updated categories
    const sampleTasks = [
      { title: "Morning Meditation", tags: ["Personal"], priority: "High", status: "Due", dueDate: new Date(Date.now() + 86400000) },
      { title: "Code Review", tags: ["Work"], priority: "High", status: "Due", dueDate: new Date(Date.now() + 86400000) },
      { title: "Project Planning", tags: ["Work"], priority: "Medium", status: "Due", dueDate: new Date(Date.now() + 2 * 86400000) },
      { title: "Gym Workout", tags: ["Health"], priority: "Medium", status: "Due", dueDate: new Date(Date.now() + 86400000) },
      { title: "Learning Session", tags: ["Learning"], priority: "Low", status: "Due", dueDate: new Date(Date.now() + 3 * 86400000) },
      { title: "Weekly Standup", tags: ["Work"], priority: "High", status: "Due", dueDate: new Date(Date.now() + 86400000) },
      { title: "Read Technical Article", tags: ["Learning"], priority: "Low", status: "Due", dueDate: new Date(Date.now() + 2 * 86400000) },
      { title: "Lunch Break", tags: ["Personal"], priority: "Medium", status: "Due", dueDate: new Date(Date.now() + 86400000) },
    ];

    const tasks = await Task.create(
      sampleTasks.map(task => ({
        ...task,
        userId: demoUser._id,
      }))
    );
    console.log(`✓ Created ${tasks.length} sample tasks with updated categories`);

    // Create sample routine
    await Routine.create({
      userId: demoUser._id,
      name: "My Weekly Routine",
      items: [
        { day: "Monday", startTime: 480, duration: 20 },
        { day: "Monday", startTime: 540, duration: 60 },
        { day: "Tuesday", startTime: 480, duration: 20 },
        { day: "Tuesday", startTime: 600, duration: 90 },
        { day: "Wednesday", startTime: 480, duration: 60 },
        { day: "Thursday", startTime: 540, duration: 45 },
        { day: "Friday", startTime: 480, duration: 30 },
        { day: "Friday", startTime: 540, duration: 30 },
        { day: "Saturday", startTime: 600, duration: 60 },
        { day: "Sunday", startTime: 480, duration: 20 },
      ],
    });
    console.log("✓ Created sample routine");

    displayDemoCredentials();

    await mongoose.connection.close();
    console.log("✓ Database connection closed");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
