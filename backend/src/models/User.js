import mongoose from "mongoose";

// User schema
const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rewardPoints: {
  type: Number,
  default: 0,
},

currentStreak: {
  type: Number,
  default: 0,
},

lastCompletedDate: {
  type: Date,
  default: null,
},

lastRewardClaimDate: {
  type: Date,
  default: null,
},
  },
  { timestamps: true }
);

// User schema model
const userModel = mongoose.model("User", userSchema);

export default userModel;
