import mongoose from "mongoose";

// User schema
const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pushSubscription: { type: Object, default: null },
    activeRoutineIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Routine" }],
  },
  { timestamps: true }
);

// User schema model
const userModel = mongoose.model("User", userSchema);

export default userModel;
