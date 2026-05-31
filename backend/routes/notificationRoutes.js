import express from "express";
import { getVapidKey, subscribe, updateActiveRoutines } from "../controllers/notificationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/vapid-public-key", authMiddleware, getVapidKey);
router.post("/subscribe", authMiddleware, subscribe);
router.post("/active-routines", authMiddleware, updateActiveRoutines);

export default router;
