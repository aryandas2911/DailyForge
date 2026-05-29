import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
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

const User = mongoose.model('User', userSchema);

export default User;