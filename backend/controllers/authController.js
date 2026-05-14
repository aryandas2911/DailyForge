import User from "../src/models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// sign up function
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const checkExisting = await User.findOne({ email });

    if (checkExisting) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      message: "Server error during signup",
    });
  }
};

// login function
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(409).json({
        message: "User does not exist",
      });
    }

    const passwordCheck = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordCheck) {
      return res.status(401).json({
        message: "Password does not match",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.log("Login error: ", error);

    return res.status(500).json({
      message: "Server error during login",
    });
  }
};

// access user details function
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: user,
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Error fetching user data",
      success: false,
    });
  }
};