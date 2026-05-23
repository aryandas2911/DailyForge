import express from "express";
import { getIntelligence } from "../controllers/intelligenceController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const intelligenceRouter = express.Router();

// GET /api/intelligence - protected by authMiddleware
intelligenceRouter.get("/", authMiddleware, getIntelligence);
