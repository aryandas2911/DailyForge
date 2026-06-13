import express from "express";
import { getXP } from "../controllers/XpController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const xpRouter = express.Router();

// GET /api/xp — fetch current user XP data
xpRouter.get("/", authMiddleware, getXP);