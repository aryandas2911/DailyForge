import express from "express";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "../config/db.js";
import { authRouter } from "../routes/authRoutes.js";
import { taskRouter } from "../routes/taskRoutes.js";
import { routineRouter } from "../routes/routineRoutes.js";
import { analyticsRouter } from "../routes/analyticsRoutes.js";
import { journalRouter } from "../routes/journalRoutes.js";
import { rateLimit } from "express-rate-limit";

// dotenv config
dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });
const PORT = process.env.PORT;

// Initialize express     
const app = express();


app.use(
  cors({
    origin: [
      "https://dailyforge-frontend-lhjq.onrender.com",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      process.env.CLIENT_ORIGIN,
    ].filter(Boolean), 
    credentials: true,
  })
);
// Connect to MongoDB using mongoose
connectDB();

// Middleware for parsing cookies and request body

app.use(cookieParser());
app.use(express.json());

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Limit each IP to 20 requests per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts, please try again later." },
});

// Router for accessing auth routes
app.use("/api/auth", authLimiter, authRouter);

// Router for accessing task routes
app.use("/api/tasks", taskRouter);

// Router for accessing routine routes
app.use("/api/routines", routineRouter);

// Router for accessing analytics routes
app.use("/api/analytics", analyticsRouter);

// Router for accessing journal routes
app.use("/api/journal", journalRouter);

app.get("/", (req, res) => {
  res.send("Server running");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected error occurred. Please try again later.",
  });
});

// Start server on port (in .env file)
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}\nhttp://localhost:${PORT}/`);
});