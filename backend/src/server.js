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
import { validateEnv } from "../utils/envValidator.js";

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
  })
);
// Connect to MongoDB using mongoose
connectDB();

// Middleware for parsing cookies and request body

app.use(cookieParser());
app.use(express.json());

// Router for accessing auth routes
app.use("/api/auth", authRouter);

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

// Start server on port (in .env file)
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}\nhttp://localhost:${PORT}/`);
});