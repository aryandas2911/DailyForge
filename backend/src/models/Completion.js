import mongoose from "mongoose";

// Completion schema — records a single routine-task completion for a specific calendar date
const completionSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    routineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Routine",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tasks",
      required: true,
    },
    // Weekday label from the routine item (e.g. "Monday")
    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    // ISO calendar date string (YYYY-MM-DD) — the actual date the user marked complete
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    // Duration in minutes — copied from the routine item at mark time
    duration: {
      type: Number,
      required: true,
      min: 10,
    },
    // Timestamp when the user pressed complete
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Unique constraint: a user cannot mark the same task in the same routine on the same date twice
completionSchema.index(
  { userId: 1, routineId: 1, taskId: 1, date: 1 },
  { unique: true }
);

// Aggregation index: fast weekly/daily progress queries
completionSchema.index({ userId: 1, routineId: 1, date: 1 });

// Completion model using schema
const Completion = mongoose.model("Completion", completionSchema);

export default Completion;
