import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: null },
    twoFactorTempSecret: { type: String, default: null },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);
export default userModel;