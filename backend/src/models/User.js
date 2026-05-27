import mongoose from "mongoose";

// User schema
const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true },
   password: { type: String, required: true },

resetPasswordToken: {
  type: String
},

resetPasswordExpires: {
  type: Date
},
  },
  { timestamps: true }
);

// User schema model
const userModel = mongoose.model("User", userSchema);

export default userModel;
