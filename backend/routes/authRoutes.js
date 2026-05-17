import express from "express";
import { getUser, login, signup, requestPasswordReset, verifyOTP, resetPassword } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

// router object for auth
export const authRouter = express.Router();

// Route for signup
authRouter.post("/signup", signup);

// Route for login
authRouter.post("/login", login);

// Route for get user (me)
authRouter.get("/me", authMiddleware, getUser);

// Route for forgot password (request OTP)
authRouter.post("/forgot-password", requestPasswordReset);

// Route for verify OTP
authRouter.post("/verify-otp", verifyOTP);

// Route for reset password
authRouter.post("/reset-password", resetPassword);
