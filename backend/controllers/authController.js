import User from "../src/models/User.js";
import OTP from "../src/models/OTP.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOTP, getOTPExpiry, isValidOTP } from "../utils/otpUtils.js";
import { sendOTPEmail } from "../utils/emailService.js";

// sign up function
export const signup = async (req, res) => {
  try {
    // fetch values from request
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters long" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters long, include an uppercase letter, a digit, and a special character" });
    }

    // check user exists or not
    const checkExisting = await User.findOne({ email });
    if (checkExisting) {
      return res.status(409).json({ message: "User already exists" });
    }

    // hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user document
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // save the new user in database
    await newUser.save();

    // generate token using jwt
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    return res
      .status(201)
      .json({ message: "User registered successfully", token });
  } catch (error) {
    // error handling
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error during signup" });
  }
};

// login function
export const login = async (req, res) => {
  try {
    // fetch user data from request
    const { email, password } = req.body;

    // check if email and password exist in request
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // check if user exists or not
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(409).json({ message: "User does not exist" });
    }

    // check password using bcrypt
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return res.status(401).json({ message: "Password does not match" });
    }

    // generate jwt token
   const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
);
    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    // error handling
    console.log("Login error: ", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// access user details function
export const getUser = async (req, res) => {
  try {
    // fetch user data from request
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user: user });
  } catch (_error) {
    // error handling
    return res
      .status(500)
      .json({ message: "Error fetching user data", success: false });
  }
};

// Request password reset - sends OTP to email
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist" });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email, isUsed: false });

    // Save new OTP to database
    const newOTP = new OTP({
      email,
      otp,
      expiresAt,
      isUsed: false,
    });
    await newOTP.save();

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Delete OTP if email fails
      await OTP.deleteOne({ _id: newOTP._id });
      return res
        .status(500)
        .json({ message: "Failed to send OTP. Please try again." });
    }

    return res
      .status(200)
      .json({
        message: "OTP sent to your email. It will expire in 10 minutes.",
      });
  } catch (error) {
    console.error("Password reset request error:", error);
    return res.status(500).json({ message: "Server error during password reset request" });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    if (!isValidOTP(otp)) {
      return res.status(400).json({ message: "Invalid OTP format" });
    }

    // Find OTP in database
    const otpRecord = await OTP.findOne({ email, otp, isUsed: false });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ message: "Server error during OTP verification" });
  }
};

// Reset password after OTP verification
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password are required" });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long, include an uppercase letter, a digit, and a special character",
      });
    }

    // Verify OTP is marked as used (already verified)
    const otpRecord = await OTP.findOne({ email, otp, isUsed: true });
    if (!otpRecord) {
      return res
        .status(400)
        .json({ message: "Invalid OTP or OTP not verified" });
    }

    // Check OTP expiry (should still be recent)
    if (new Date() > new Date(otpRecord.expiresAt.getTime() + 5 * 60 * 1000)) {
      // Allow 5 minutes after expiry for verification completion
      return res.status(400).json({ message: "OTP session expired" });
    }

    // Find user and update password
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({ message: "Server error during password reset" });
  }
};
