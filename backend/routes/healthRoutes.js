import express from "express";
import mongoose from "mongoose";

export const healthRouter = express.Router();

// Mongoose readyState codes:
// 0 = disconnected | 1 = connected | 2 = connecting | 3 = disconnecting
const DB_STATES = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

// GET /api/health
healthRouter.get("/", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = DB_STATES[dbState] ?? "unknown";
  const isHealthy = dbState === 1;

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    db: dbStatus,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});
