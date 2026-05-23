import mongoose from "mongoose";

const habitSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    logs: [
      {
        type: String, // Date string format: "YYYY-MM-DD"
      },
    ],
    currentStreak: {
      type: Number,
      default: 0,
    },
    bestStreak: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const habitModel = mongoose.model("Habit", habitSchema);

export default habitModel;
