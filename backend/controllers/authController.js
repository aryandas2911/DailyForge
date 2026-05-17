import User from "../src/models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

// sign up function
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    throw new AppError("Name must be at least 2 characters long", 400);
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!password || !passwordRegex.test(password)) {
    throw new AppError(
      "Password must be at least 8 characters long, include an uppercase letter, a digit, and a special character",
      400
    );
  }

  const checkExisting = await User.findOne({ email });
  if (checkExisting) {
    throw new AppError("User already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  await newUser.save();

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  return res
    .status(201)
    .json({ message: "User registered successfully", token });
};

// login function
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User does not exist", 409);
  }

  const passwordCheck = await bcrypt.compare(password, user.password);
  if (!passwordCheck) {
    throw new AppError("Password does not match", 401);
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
  return res.status(200).json({ message: "Login successful", token });
};

// access user details function
export const getUser = async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return res.status(200).json({ success: true, user: user });
};
