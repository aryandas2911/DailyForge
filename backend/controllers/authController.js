import User from "../src/models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOTP } from "../utils/emailVarification.js";

const pendingUsers = new Map();
const verificationToken = crypto.randomUUID();

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


    const otp = await sendOTP(email);
    pendingUsers.set(verificationToken, { name, email, password: hashedPassword});

    return res.json({
      success: true,
      message: "otp sent",
      verificationToken
    })

  } catch (error) {
    // error handling
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error during signup" });
  }
};


export const verifyUser = async (req, res) => {
  const { otp,verificationToken} = req.body;
  
  try {
    if (!otp) {
      return res.status(400).json({ success: false, message: "OTP is required." });
    }

    const pending = pendingUsers.get(verificationToken);

    if (!pending) {
      return res.status(400).json({
        success: false,
        message: "Signup session expired. Please sign up again.",
      });

    }
    const newUser = new User({
      name:pending.name,
      email:pending.email,
      password: pending.password,
    });

    // save the new user in database
    await newUser.save();

    pendingUsers.delete(verificationToken);

    // generate token using jwt
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return res
      .status(201)
      .json({ message: "User registered successfully", token });
  } catch (error) {

  }
}



export const resend=async (req, res) => {
  const {verificationToken}=req.body
  const user=pendingUsers.get(verificationToken)
  const {email}=user;

  try { 
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    // Must have a pending signup
    if (!pendingUsers.has(verificationToken)) {
      return res.status(400).json({
        success: false,
        message: "No pending signup found for this email. Please sign up again.",
      });
    }

    await sendOTP(email);

    return res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email.",
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    return res.status(500).json({ success: false, message: "Failed to resend OTP. Please try again." });
  }
}

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
