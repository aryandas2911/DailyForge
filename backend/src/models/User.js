import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    photo: {
      type: String,
      required: false,
    },

    // ─── Two-Factor Authentication ──────────────────────────────────────────
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    // Encrypted (AES-256-CBC) base32 TOTP secret
    twoFactorSecret: {
      type: String,
      default: null,
    },

    // Temporary encrypted secret during setup
    twoFactorTempSecret: {
      type: String,
      default: null,
    },

    // bcrypt-hashed backup codes
    backupCodes: {
      type: [String],
      default: [],
    },

    primaryColor: {
      type: String,
      default: "#3b82f6",
    },
    // ────────────────────────────────────────────────────────────────────────
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    resetPasswordUsed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
