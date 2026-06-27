import crypto from "crypto";
import User from "../src/models/User.js";

// Generates a unique Telegram link code for the logged-in user.
// Frontend calls this, then opens the returned link — user taps Start in Telegram once.
export const generateTelegramLink = async (req, res) => {
  try {
    const userId = req.userId; // set by authMiddleware

    const code = crypto.randomBytes(8).toString("hex");

    const user = await User.findByIdAndUpdate(
      userId,
      { telegramLinkCode: code },
      { returnDocument: "after" }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    const link = `https://t.me/${botUsername}?start=${code}`;

    res.status(200).json({
      success: true,
      link,
      alreadyLinked: Boolean(user.telegramChatId),
    });
  } catch (err) {
    console.error("generateTelegramLink error:", err);
    res.status(500).json({ success: false, message: "Failed to generate Telegram link" });
  }
};

// Handles incoming updates from Telegram (messages sent to the bot)
export const telegramWebhook = async (req, res) => {
  try {
    const update = req.body;
    const message = update.message;

    if (!message || !message.text) {
      return res.sendStatus(200); // acknowledge, nothing to process
    }

    const chatId = message.chat.id.toString();
    const text = message.text.trim();

    // Expecting: "/start <linkCode>"
    if (text.startsWith("/start")) {
      const parts = text.split(" ");
      const linkCode = parts[1];

      if (!linkCode) {
        await sendTelegramMessage(
          chatId,
          "Welcome! Please use the link from the DailyForge app to connect your account."
        );
        return res.sendStatus(200);
      }

      const user = await User.findOneAndUpdate(
        { telegramLinkCode: linkCode },
        { telegramChatId: chatId, telegramLinkCode: null },
        { returnDocument: "after" }
      );

      if (user) {
        await sendTelegramMessage(
          chatId,
          `Linked! Hi ${user.name}, you'll now get DailyForge reminders here.`
        );
      } else {
        await sendTelegramMessage(
          chatId,
          "Invalid or expired code. Generate a new link from the app."
        );
      }
    }

    res.sendStatus(200); // Telegram requires a 200 response or it will retry
  } catch (err) {
    console.error("Telegram webhook error:", err);
    res.sendStatus(200); // still 200, so Telegram doesn't keep retrying a broken request
  }
};

// Helper: send a message via Telegram's HTTP API directly (no extra library needed)
export const sendTelegramMessage = async (chatId, text) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });
  } catch (err) {
    console.error("Failed to send Telegram message:", err);
  }
};