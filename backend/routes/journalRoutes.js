import express from "express";
import {
  getJournalByDate,
  createOrUpdateJournal,
  getJournals,
  deleteJournal,
  getJournalAnalytics,
} from "../controllers/journalController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const journalRouter = express.Router();

journalRouter.get("/analytics", authMiddleware, getJournalAnalytics);
journalRouter.get("/by-date/:date", authMiddleware, getJournalByDate);
journalRouter.post("/", authMiddleware, createOrUpdateJournal);
journalRouter.get("/", authMiddleware, getJournals);
journalRouter.delete("/:id", authMiddleware, deleteJournal);
