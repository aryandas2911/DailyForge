import express from "express";
import { telegramWebhook, generateTelegramLink } from "../controllers/telegramController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Telegram calls this endpoint automatically when a user messages the bot
router.post("/webhook", telegramWebhook);

// Logged-in user requests their personal Telegram connect link
router.get("/link", authMiddleware, generateTelegramLink);

export { router as telegramRouter };