import User from "../src/models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
  successResponse,
  errorResponse,
} from "../utils/apiResponse.js";

// sign up function
export const signup = async (req, res) => {
  try {
    // fetch values from request
    const { name, email, password } = req.body;

    // check user exists or not
    const checkExisting = await User.findOne({ email });
    if (checkExisting) {
      return errorResponse(res, "User already exists", 409);
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
    return successResponse(
      res,
      "User registered successfully",
      { token },
      201
    );
  } catch (error) {
    // error handling
    console.error("Signup error:", error);
    return errorResponse(
      res,
      "Server error during signup",
      500
    );
  }
};

// login function
export const login = async (req, res) => {
  try {
    // fetch user data from request
    const { email, password } = req.body;

    // check if email and password exist in request
    if (!email || !password) {
      return errorResponse(
        res,
        "Email and password are required",
        400
      );
    }

    // check if user exists or not
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(
        res,
        "User does not exist",
        409
      );
    }

    // check password using bcrypt
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return errorResponse(
        res,
        "Password does not match",
        401
      );
    }

    // generate jwt token
   const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
    return successResponse(
      res,
      "Login successful",
      { token },
      200
    );
  } catch (error) {
    // error handling
    console.log("Login error: ", error);
    return errorResponse(
      res,
      "Server error during login",
      500
    );
  }
};

// access user details function
export const getUser = async (req, res) => {
  try {
    // fetch user data from request
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return errorResponse(
        res,
        "User not found",
        404
      );
    }
    return successResponse(
      res,
      "User fetched successfully",
      { user },
      200
    );
  } catch (_error) {
    // error handling
    return errorResponse(
      res,
      "Error fetching user data",
      500
    );
  }
};
