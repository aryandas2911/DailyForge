import mongoose from "mongoose";

// User schema
const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true},
    email: { type: String, required: true, unique: true , trim: true},
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// User schema model
const userModel = mongoose.model("User", userSchema);

export default userModel;
