import Journal from "../src/models/Journal.js";
import User from "../src/models/User.js";
import mongoose from "mongoose";

export const getJournalByDate = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { date } = req.params; // format: YYYY-MM-DD
    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required" });
    }

    const journal = await Journal.findOne({ userId, date });
    return res.status(200).json({ success: true, journal });
  } catch (error) {
    console.error("Error in getJournalByDate:", error);
    return res.status(500).json({ success: false, message: "Error fetching journal entry" });
  }
};

// Create or update journal entry for a user on a specific date
export const createOrUpdateJournal = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { date, title, content, mood, tags } = req.body;

    if (!date || !content || !mood) {
      return res.status(400).json({
        success: false,
        message: "Date, content, and mood are required",
      });
    }

    const validMoods = ["happy", "calm", "neutral", "stressed", "sad", "energetic", "tired"];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({
        success: false,
        message: `Invalid mood. Must be one of: ${validMoods.join(", ")}`,
      });
    }

    const journal = await Journal.findOneAndUpdate(
      { userId, date },
      {
        $set: {
          title: title || "",
          content,
          mood,
          tags: Array.isArray(tags) ? tags : [],
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Journal entry saved successfully",
      journal,
    });
  } catch (error) {
    console.error("Error in createOrUpdateJournal:", error);
    return res.status(500).json({ success: false, message: "Error saving journal entry" });
  }
};

// Get all journal entries with optional filters (search, mood, tag, date range)
export const getJournals = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { search, mood, tag, startDate, endDate } = req.query;
    const query = { userId };

    if (mood) {
      query.mood = mood;
    }

    if (tag) {
      query.tags = tag;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = startDate;
      }
      if (endDate) {
        query.date.$lte = endDate;
      }
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { content: { $regex: escapedSearch, $options: "i" } },
        { tags: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const journals = await Journal.find(query).sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      journals,
    });
  } catch (error) {
    console.error("Error in getJournals:", error);
    return res.status(500).json({ success: false, message: "Error fetching journal history" });
  }
};

// Delete a journal entry
export const deleteJournal = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const journalId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(journalId)) {
      return res.status(400).json({ success: false, message: "Invalid journal ID format" });
    }

    const deletedJournal = await Journal.findOneAndDelete({
      _id: journalId,
      userId,
    });

    if (!deletedJournal) {
      return res.status(404).json({ success: false, message: "Journal entry not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Journal entry deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteJournal:", error);
    return res.status(500).json({ success: false, message: "Error deleting journal entry" });
  }
};

// Get Daily Journal Analytics (totals, streak, mood counts, monthly activity, tags)
export const getJournalAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 1. Total journal entries
    const totalEntries = await Journal.countDocuments({ userId });

    // 2. Streak calculation (consecutive days of journal logging)
    const journals = await Journal.find({ userId }).select("date").sort({ date: 1 });
    const uniqueDates = [...new Set(journals.map((j) => j.date))]; // unique YYYY-MM-DD sorted strings

    let currentStreak = 0;
    let bestStreak = 0;

    if (uniqueDates.length > 0) {
      const formatDateStr = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const todayStr = formatDateStr(new Date());
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateStr(yesterday);

      let checkDate = null;
      if (uniqueDates.includes(todayStr)) {
        checkDate = new Date(todayStr + "T00:00:00");
      } else if (uniqueDates.includes(yesterdayStr)) {
        checkDate = new Date(yesterdayStr + "T00:00:00");
      }

      if (checkDate) {
        let tempDate = new Date(checkDate);
        while (true) {
          const tempStr = formatDateStr(tempDate);
          if (uniqueDates.includes(tempStr)) {
            currentStreak++;
            tempDate.setDate(tempDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // Best streak calculation
      let currentRun = 0;
      let prevDate = null;
      for (const dateStr of uniqueDates) {
        const currentDate = new Date(dateStr + "T00:00:00");
        if (!prevDate) {
          currentRun = 1;
        } else {
          const diffTime = Math.abs(currentDate - prevDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            currentRun++;
          } else if (diffDays > 1) {
            currentRun = 1;
          }
        }
        bestStreak = Math.max(bestStreak, currentRun);
        prevDate = currentDate;
      }
    }

    // 3. Mood Counts
    const moodCounts = {
      happy: 0,
      calm: 0,
      neutral: 0,
      stressed: 0,
      sad: 0,
      energetic: 0,
      tired: 0,
    };
    const moodAggregate = await Journal.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$mood", count: { $sum: 1 } } },
    ]);
    moodAggregate.forEach((item) => {
      if (moodCounts[item._id] !== undefined) {
        moodCounts[item._id] = item.count;
      }
    });

    // 4. Monthly Journaling activity (last 6 months)
    const monthlyActivity = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = targetMonth.getFullYear();
      const month = targetMonth.getMonth();

      const yearStr = String(year);
      const monthStr = String(month + 1).padStart(2, "0");
      const prefix = `${yearStr}-${monthStr}`; // matches "YYYY-MM"

      const count = await Journal.countDocuments({
        userId,
        date: { $regex: `^${prefix}` },
      });

      monthlyActivity.push({
        label: targetMonth.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        count,
      });
    }

    // 5. Popular tags cloud
    const tagsCounts = {};
    const journalsWithTags = await Journal.find({ userId }).select("tags");
    journalsWithTags.forEach((j) => {
      if (j.tags) {
        j.tags.forEach((tag) => {
          tagsCounts[tag] = (tagsCounts[tag] || 0) + 1;
        });
      }
    });
    const popularTags = Object.entries(tagsCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      analytics: {
        totalEntries,
        currentStreak,
        bestStreak,
        moodCounts,
        monthlyActivity,
        popularTags,
      },
    });
  } catch (error) {
    console.error("Error in getJournalAnalytics controller:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching journal analytics data",
    });
  }
};
