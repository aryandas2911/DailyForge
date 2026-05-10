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

// Intialize cors
app.use(
  cors({
    origin: "https://dailyforge-frontend-lhjq.onrender.com",
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
  console.log(`Server running at port ${PORT}\nhttp://localhost:${PORT}/`);
});
