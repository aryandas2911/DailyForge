import express from "express";

export const healthRouter = express.Router();

// GET /health - public health check endpoint for monitoring tools
healthRouter.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
