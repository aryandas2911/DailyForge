import mongoose from "mongoose";

// User schema
const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 30,
      match: [/^[a-z][a-z0-9_-]*$/, "Invalid username format"],
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// User schema model
const userModel = mongoose.model("User", userSchema);

export default userModel;
