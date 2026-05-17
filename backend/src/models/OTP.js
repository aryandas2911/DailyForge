import mongoose from "mongoose";

// OTP schema for password reset
const otpSchema = mongoose.Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Automatically delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// OTP schema model
const otpModel = mongoose.model("OTP", otpSchema);

export default otpModel;
