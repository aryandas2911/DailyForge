import "dotenv/config"; // 1. Load environment variables before anything else
import express from "express";
import cors from "cors";
import connectDB from "../config/db.js";
import { authRouter } from "../routes/authRoutes.js";
import { taskRouter } from "../routes/taskRoutes.js";
import { routineRouter } from "../routes/routineRoutes.js";

// Initialize express app
const app = express();

// 2. Allow both 5173 and 5174 for local development
app.use(
  cors({
    origin: [
      "https://dailyforge-frontend-lhjq.onrender.com",
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.CLIENT_ORIGIN
    ].filter(Boolean),
    credentials: true,
  })
);

// 3. Connect to Database
connectDB();

// 4. Middleware for parsing JSON body
app.use(express.json());

// 5. Routes
app.use("/api/auth", authRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/routines", routineRouter);

app.get("/", (req, res) => {
  res.send("Server running");
});

// 6. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}\nhttp://localhost:${PORT}/`);
});
