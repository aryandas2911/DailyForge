import speakeasy from "speakeasy";
import QRCode from "qrcode";
import User from "../src/models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyFirebaseIdToken } from "../utils/firebaseAuth.js";
import crypto from "crypto";
import { generateRecurringTasks } from '../utils/generateRecurringTasks.js';
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import nodemailer from "nodemailer"; // Added for email sending
import dotenv from "dotenv";
dotenv.config();

// ─── Encryption helpers for twoFactorSecret ───────────────────────────────────
const ENCRYPTION_KEY = process.env.TWO_FACTOR_ENCRYPTION_KEY; // 64-char hex (32 bytes)


if (!ENCRYPTION_KEY || Buffer.from(ENCRYPTION_KEY, "hex").length !== 32) {
  throw new Error("TWO_FACTOR_ENCRYPTION_KEY must be a 32-byte hex key");
}

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv,
  );
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  const [iv, encrypted] = text.split(":").map((p) => Buffer.from(p, "hex"));
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv,
  );
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString();
}
// ──────────────────────────────────────────────────────────────────────────────

const JWT_ALGORITHM = process.env.JWT_ALGORITHM || "HS256";
const AUTH_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

const getJwtSecret = (res) => {
  if (!process.env.JWT_SECRET) {
    res
      .status(500)
      .json({ message: "Authentication service is misconfigured" });
    return null;
  }
  return process.env.JWT_SECRET;
};

const isProduction = process.env.NODE_ENV === "production";
const getAuthCookieOptions = () => {
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  };
  const cookieDomain =
    process.env.AUTH_COOKIE_DOMAIN || process.env.COOKIE_DOMAIN;
  if (cookieDomain) cookieOptions.domain = cookieDomain;
  return cookieOptions;
};

// ─── Sign up ──────────────────────────────────────────────────────────────────
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Name must be at least 2 characters long" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!password || typeof password !== "string" || !passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long, include an uppercase letter, a digit, and a special character",
      });
    }

    const checkExisting = await User.findOne({ email });
    if (checkExisting) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const jwtSecret = getJwtSecret(res);
    if (!jwtSecret) return;

    const token = jwt.sign({ userId: newUser._id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
      algorithm: JWT_ALGORITHM,
    });

    return res
      .status(201)
      .cookie("token", token, getAuthCookieOptions())
      .json({
        message: "User registered successfully",
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          primaryColor: newUser.primaryColor,
        },
      });
  } catch (_error) {
    console.error("Signup error:", _error);
    return res.status(500).json({ message: "Server error during signup" });
  }
};

// ─── Login (handles 2FA check) ────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Do NOT reveal whether the user exists
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If 2FA is enabled, ask client to submit TOTP before issuing JWT
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        requires2FA: true,
        tempUserId: user._id,
      });
    }

    const jwtSecret = getJwtSecret(res);
    if (!jwtSecret) return;

    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
      algorithm: JWT_ALGORITHM,
    });
    // fire-and-forget — does NOT block login response
    generateRecurringTasks(user._id).catch((err) =>
      console.error("[RecurringTasks] generation error:", err)
    );
    return res
      .status(200)
      .cookie("token", token, getAuthCookieOptions())
      .json({
        message: "Login successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          primaryColor: user.primaryColor,
        },
      });
  } catch (_error) {
    console.log("Login error: ", _error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// ─── Forgot Password Request ──────────────────────────────────────────────────
export const forgotPasswordRequest = async (req, res) => {
  const { email } = req.body;

  // Validate Input: Basic email format validation
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    // Always send a generic success message to prevent user enumeration
    return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent to your inbox.' });
  }

  try {
    const user = await User.findOne({ email });

    // Generate Token & Store Hashed Token (if user exists)
    if (user) {

      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = await bcrypt.hash(resetToken, 10);

      // Set token and expiration on user document
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now (in milliseconds)
      user.resetPasswordUsed = false; // Reset flag
      await user.save();

      // Send Email
      // Configure Nodemailer transporter (ensure EMAIL_FROM and EMAIL_PASS are in your .env)
      const emailUser = process.env.EMAIL_FROM;
      const emailPass = process.env.EMAIL_PASS;

      if (!emailUser || !emailPass) {
        console.error("Nodemailer configuration error: EMAIL_FROM or EMAIL_PASS environment variables are not set. Please check your .env file.");
        throw new Error("Email service not configured. Please set EMAIL_FROM and EMAIL_PASS in your .env file.");
      }

      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'Gmail', // e.g., 'Gmail', 'SendGrid', etc.
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      // Construct the reset URL for the frontend
      const resetUrl = `${
        process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_ORIGIN
        : process.env.FRONTEND_URL || 'http://localhost:5173'
      }/reset-password?token=${resetToken}`;

      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_FROM, // Sender email
        subject: 'DailyForge Password Reset Request',
        html: `
          <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
          <p>Please click on the following link, or paste this into your browser to complete the process:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        `,
      };
      await transporter.sendMail(mailOptions);
    }

    // Generic Response (always send this, regardless of whether user was found)
    res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent to your inbox.' });

  } catch (error) {
    console.error('Forgot password request error:', error);
    // Log the actual error but send a generic message to the client
    res.status(500).json({ message: 'An error occurred while processing your request. Please try again later.' });
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  const { token, newPassword, confirmNewPassword } = req.body;

  // Validate Input
  if (!token || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: "New password and confirm password do not match." });
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long, include an uppercase letter, a digit, and a special character",
    });
  }

  try {
    const users = await User.find({
      resetPasswordExpires: { $gt: Date.now() },
      resetPasswordUsed: false,
    });

    let user = null;
    for (const u of users) {
      const isMatch = await bcrypt.compare(token, u.resetPasswordToken);
      if (isMatch) {
        user = u;
        break;
      }
    }

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired." });
    }

    // Update password and invalidate token
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined; // Clear the token
    user.resetPasswordExpires = undefined; // Clear the expiration
    user.resetPasswordUsed = true; // Mark token as used
    await user.save();

    return res.status(200).json({ message: "Password has been reset successfully. You can now log in." });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'An error occurred while resetting your password. Please try again later.' });
  }
};

// ─── Complete login with TOTP code ────────────────────────────────────────────
export const loginWith2FA = async (req, res) => {
  try {
    const { tempUserId, token } = req.body;

    // Validate TOTP format first — must be exactly 6 digits
    if (!token || !/^\d{6}$/.test(token)) {
      return res.status(400).json({ message: "Invalid code format" });
    }

    const user = await User.findById(tempUserId);
    // Use same message for missing user and wrong code — don't leak user presence
    if (!user || !user.twoFactorSecret) {
      return res.status(401).json({ message: "Invalid credentials or code" });
    }

    const verified = speakeasy.totp.verify({
      secret: decrypt(user.twoFactorSecret), // decrypt before verifying
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(401).json({ message: "Invalid credentials or code" });
    }

    const jwtSecret = getJwtSecret(res);
    if (!jwtSecret) return;

    const jwtToken = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
      algorithm: JWT_ALGORITHM,
    });

    return res
      .status(200)
      .cookie("token", jwtToken, getAuthCookieOptions())
      .json({
        message: "Login successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          primaryColor: user.primaryColor,
        },
      });
  } catch (_error) {
    return res.status(500).json({ message: "Server error during 2FA login" });
  }
};

// ─── Generate secret and QR code ─────────────────────────────────────────────
export const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const secret = speakeasy.generateSecret({
      name: `DailyForge (${user.email})`,
    });

    // Encrypt the temp secret before storing in DB
    await User.findByIdAndUpdate(req.userId, {
      twoFactorTempSecret: encrypt(secret.base32),
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    return res.status(200).json({ qrCodeUrl, secret: secret.base32 });
  } catch (_error) {
    return res.status(500).json({ message: "Error setting up 2FA" });
  }
};

// ─── Verify TOTP and enable 2FA ───────────────────────────────────────────────
export const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;

    // Validate TOTP format — must be exactly 6 digits
    if (!token || !/^\d{6}$/.test(token)) {
      return res.status(400).json({ message: "Invalid code format" });
    }

    const user = await User.findById(req.userId);
    if (!user || !user.twoFactorTempSecret) {
      return res.status(400).json({ message: "Invalid credentials or code" });
    }

    const verified = speakeasy.totp.verify({
      secret: decrypt(user.twoFactorTempSecret), // decrypt before verifying
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid credentials or code" });
    }

    // Generate backup codes — show plain text once, store hashed
    const plainCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(5).toString("hex").toUpperCase(),
    );
    const hashedCodes = await Promise.all(
      plainCodes.map((c) => bcrypt.hash(c, 10)),
    );

    await User.findByIdAndUpdate(req.userId, {
      twoFactorSecret: user.twoFactorTempSecret, // already encrypted, move to permanent field
      twoFactorEnabled: true,
      twoFactorTempSecret: null,
      backupCodes: hashedCodes,
    });

    return res.status(200).json({
      message: "2FA enabled successfully",
      backupCodes: plainCodes, // shown to user ONE TIME only — they must save these
    });
  } catch (_error) {
    return res.status(500).json({ message: "Error verifying 2FA" });
  }
};

// ─── Disable 2FA (requires TOTP confirmation) ─────────────────────────────────
export const disable2FA = async (req, res) => {
  try {
    const { token } = req.body;

    // Validate TOTP format — must be exactly 6 digits
    if (!token || !/^\d{6}$/.test(token)) {
      return res.status(400).json({ message: "Invalid or missing TOTP code" });
    }

    const user = await User.findById(req.userId);
    if (!user || !user.twoFactorSecret) {
      return res.status(401).json({ message: "Invalid credentials or code" });
    }

    const verified = speakeasy.totp.verify({
      secret: decrypt(user.twoFactorSecret), // decrypt before verifying
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(401).json({ message: "Invalid credentials or code" });
    }

    await User.findByIdAndUpdate(req.userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: [],
    });

    return res.status(200).json({ message: "2FA disabled" });
  } catch (_error) {
    return res.status(500).json({ message: "Error disabling 2FA" });
  }
};

// ─── Get user ─────────────────────────────────────────────────────────────────
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (_error) {
    return res
      .status(500)
      .json({ message: "Error fetching user data", success: false });
  }
};

// ─── Update profile ───────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    if (req.body.primaryColor) user.primaryColor = req.body.primaryColor;

    if (currentPassword && newPassword) {
      const passwordCheck = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!passwordCheck) {
        return res
          .status(401)
          .json({ success: false, message: "Current password is incorrect" });
      }
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!newPassword || !passwordRegex.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message:
            "New Password must be at least 8 characters long, include an uppercase letter, a digit, and a special character",
        });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        primaryColor: user.primaryColor,
      },
    });
  } catch (_error) {
    console.log("Profile update error:", _error);
    return res
      .status(500)
      .json({ success: false, message: "Server error while updating profile" });
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = (req, res) => {
  res.clearCookie("token", getAuthCookieOptions());
  return res.status(200).json({ message: "Logout successful" });
};

// ─── Google Login ─────────────────────────────────────────────────────────────
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Firebase ID Token is required" });
    }

    let decodedToken;
    try {
      decodedToken = await verifyFirebaseIdToken(idToken);
    } catch (verifyError) {
      console.error("[GOOGLE AUTH]", verifyError);

      return res.status(401).json({
        message: "Invalid or expired Firebase token",
      });
    }

    const { email, name } = decodedToken;

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = new User({
        name: name || email.split("@")[0],
        email,
        password: hashedPassword,
      });
      await user.save();
      console.log(`[GOOGLE AUTH] Created new user profile for: ${email}`);
    } else {
      console.log(`[GOOGLE AUTH] Logged in existing user: ${email}`);
    }

    const jwtSecret = getJwtSecret(res);
    if (!jwtSecret) return;

    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
      algorithm: JWT_ALGORITHM,
    });

    return res
      .status(200)
      .cookie("token", token, getAuthCookieOptions())
      .json({
        message: "Google sign-in successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          primaryColor: user.primaryColor,
        },
      });
  } catch (_error) {
    console.error("[GOOGLE AUTH] Controller error:", _error);
    return res
      .status(500)
      .json({ message: "Server error during Google authentication" });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded or file exceeds size limit" });
    }

    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const cloudinaryResponse = await cloudinary.uploader.upload(fileBase64, {
      folder: "profile_pictures",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" }, 
        { quality: "auto" },
        { fetch_format: "auto" }, 
      ],
    });

    const secureUrl = cloudinaryResponse.secure_url;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId, 
      { photo: secureUrl },
      { new: true } 
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ 
      message: "Profile image updated successfully", 
      imageUrl: secureUrl,
      user: updatedUser 
    });

  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ error: "Internal server error during upload" });
  }
};

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
}).single("profileImage"); 
