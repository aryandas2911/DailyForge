import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "../config/db.js";
import { authRouter } from "../routes/authRoutes.js";
import { taskRouter } from "../routes/taskRoutes.js";
import { routineRouter } from "../routes/routineRoutes.js";

// dotenv config
dotenv.config();

const PORT = process.env.PORT;

// Initialize express app
const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://dailyforge-frontend-lhjq.onrender.com",
];

// Initialize cors
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman/mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Connect to MongoDB using mongoose
connectDB();

// Middleware for parsing request body
app.use(express.json());

// Router for accessing auth routes
app.use("/api/auth", authRouter);

// Router for accessing task routes
app.use("/api/tasks", taskRouter);

// Router for accessing routine routes
app.use("/api/routines", routineRouter);

app.get("/", (req, res) => {
  res.send("Server running");
});

// Start server on port (in .env file)
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
  console.log(`http://localhost:${PORT}/`);
});