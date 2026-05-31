import mongoose from 'mongoose';

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

    // ─── Two-Factor Authentication ──────────────────────────────────────────
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    // Encrypted (AES-256-CBC) base32 TOTP secret — stored as "iv:encryptedHex"
    twoFactorSecret: {
      type: String,
      default: null,
    },
    // Temporary encrypted secret during setup — cleared after verification
    twoFactorTempSecret: {
      type: String,
      default: null,
    },
    // bcrypt-hashed one-time backup codes (shown to user once on 2FA enable)
    backupCodes: {
      type: [String],
      default: [],
    },
    // ────────────────────────────────────────────────────────────────────────
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
