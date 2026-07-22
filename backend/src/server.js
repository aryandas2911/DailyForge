import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "../config/db.js";
import { authRouter } from "../routes/authRoutes.js";
import { taskRouter } from "../routes/taskRoutes.js";
import { routineRouter } from "../routes/routineRoutes.js";
import { analyticsRouter } from "../routes/analyticsRoutes.js";
import { journalRouter } from "../routes/journalRoutes.js";
import { validateEnv } from "../utils/envValidator.js";
import connectCloudinary from "../config/cloudinary.js";
import { rateLimit } from "express-rate-limit";

// dotenv config
dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });
validateEnv();
const PORT = process.env.PORT;

// Initialize express
const app = express();


// Build the list of allowed CORS origins from environment variables.
// CORS_ORIGIN supports a comma-separated list for multiple origins.
// Falls back to localhost:5173 for local development and the
// deployed frontend URL as a safe production default.
const allowedOrigins = [
  ...(process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : []),
  process.env.CLIENT_ORIGIN,
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://dailyforge-frontend-lhjq.onrender.com",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
// Connect to MongoDB using mongoose
connectDB();

// Connect to Cloudinary
connectCloudinary();

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

// ─── Startup Environment Validation ─────────────────────────────────────────
// Fail fast if required environment variables are missing or insecure.
// This prevents the server from running silently with broken authentication.
const REQUIRED_ENV_VARS = ["MONGO_URI", "JWT_SECRET"];

const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error("\n[FATAL] Missing required environment variables:");
  missingVars.forEach((key) => console.error(`  - ${key}`));
  console.error(
    "\nCopy backend/.env.example to backend/.env and fill in the values.\n"
  );
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error(
    "[FATAL] JWT_SECRET must be at least 32 characters for security."
  );
  console.error("Generate one with: openssl rand -hex 32");
  process.exit(1);
}
// ─────────────────────────────────────────────────────────────────────────────

// Global Error Handler
app.use((err, req, res, _next) => {
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
