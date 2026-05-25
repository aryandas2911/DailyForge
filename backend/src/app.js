import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { authRouter } from "../routes/authRoutes.js";
import { taskRouter } from "../routes/taskRoutes.js";
import { routineRouter } from "../routes/routineRoutes.js";
import { analyticsRouter } from "../routes/analyticsRoutes.js";

const createApp = ({ clientOrigin } = {}) => {
  const app = express();

  app.use(
    cors({
      origin: [
        "https://dailyforge-frontend-lhjq.onrender.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        clientOrigin,
      ].filter(Boolean),
      credentials: true,
    }),
  );

  app.use(cookieParser());
  app.use(express.json());

  app.use("/api/auth", authRouter);
  app.use("/api/tasks", taskRouter);
  app.use("/api/routines", routineRouter);
  app.use("/api/analytics", analyticsRouter);

  app.get("/", (_req, res) => {
    res.send("Server running");
  });

  return app;
};

export default createApp;
