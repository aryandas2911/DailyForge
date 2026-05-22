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

// Router for accessing auth routes
app.use("/api/auth", authRouter);

// Router for accessing task routes
app.use("/api/tasks", taskRouter);

// Router for accessing routine routes
app.use("/api/routines", routineRouter);

// Router for accessing analytics routes
app.use("/api/analytics", analyticsRouter);

app.get("/", (req, res) => {
  res.send("Server running");
});

// Start server on port (in .env file)
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}\nhttp://localhost:${PORT}/`);
});