import User from "../src/models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import TempUserModel from "../src/models/TempUser.js";
import {generateOTP} from "../utils/otp.js";
import {sendMail} from "../config/sendEmail.js";

// sign up function
export const signup = async (req, res) => {
  try {
    // fetch values from request
    const {name, email, password} = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }


    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters long" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters long, include an uppercase letter, a digit, and a special character" });
    }

    const checkExisting = await User.findOne({ email });
    if (checkExisting) {
      return res.status(409).json({ message: "User already exists" });
    }

    await TempUserModel.findOneAndDelete({email});

    // hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();

    // create new user document
    await TempUserModel.create({
      name,
      email,
      password: hashedPassword,
      otp: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendMail(
      email,
      `
      <h2>OTP Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 5 minutes.</p>
      `,
    );

    return res.status(201).json({message: "OTP sent successfully"});

  } catch (error) {
    // error handling
    console.error("Signup error:", error);
    return res.status(500).json({message: "Server error during signup"});
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const {email, otp} = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const tempUser = await TempUserModel.findOne({email});

    if (!tempUser) {
      return res.status(404).json({
        success: false,
        message: "OTP expired or user not found",
      });
    }

    // verify otp
    if (tempUser.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // check otp expiry
    if (tempUser.expiresAt < new Date()) {
      await TempUserModel.deleteOne({email});

      return res.status(401).json({
        success: false,
        message: "OTP expired",
      });
    }

    // create permanent user
    const user = await User.create({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    await TempUserModel.deleteOne({email});

    return res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({ message: "User registered successfully" });

  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during OTP verification",
    });
  }
};

// login function
export const login = async (req, res) => {
  try {
    // fetch user data from request
    const {email, password} = req.body;

    // check if email and password exist in request
    if (!email || !password) {
      return res.status(400).json({message: "Email and password are required"});
    }

    // check if user exists or not
    const user = await User.findOne({email});
    if (!user) {
      return res.status(409).json({message: "User does not exist"});
    }

    // check password using bcrypt
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return res.status(401).json({message: "Password does not match"});
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({ message: "Login successful" });
  } catch (error) {
    // error handling
    console.log("Login error: ", error);
    return res.status(500).json({message: "Server error during login"});
  }
};

// access user details function
export const getUser = async (req, res) => {
  try {
    // fetch user data from request
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({success: false, message: "User not found"});
    }
    return res.status(200).json({success: true, user: user});
  } catch (_error) {
    // error handling
    return res
      .status(500)
      .json({message: "Error fetching user data", success: false});
  }
};

// logout function
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res.status(200).json({ message: "Logout successful" });
};
