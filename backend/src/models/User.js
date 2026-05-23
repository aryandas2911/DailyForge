import mongoose from "mongoose";

// User schema
const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    streakFreezeCount: {
      type: Number,
      default: 2,
    },
    frozenDates: {
      type: [String],
      default: [],
    },
    lastRecoveryUsed: {
      type: Date,
      default: null,
    },
    recoveredStreaks: {
      type: Number,
      default: 0,
    },
    freezesUsed: {
      type: Number,
      default: 0,
    },
    longestProtectedStreak: {
      type: Number,
      default: 0,
    },
    lastFreezeReplenishDate: {
      type: String,
      default: null,
    },
    lastFreezeCheckDate: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// User schema model
const userModel = mongoose.model("User", userSchema);

export default userModel;
