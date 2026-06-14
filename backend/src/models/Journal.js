import mongoose from "mongoose";

const journalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, 
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    mood: {
      type: String,
      required: true,
      enum: ["happy", "calm", "neutral", "stressed", "sad", "energetic", "tired"],
    },
    tags: [{
      type: String,
      trim: true,
    }],
  },
  { timestamps: true }
);

// Ensure one journal entry per user per day
journalSchema.index({ userId: 1, date: 1 }, { unique: true });

const Journal = mongoose.model("Journal", journalSchema);

export default Journal;
