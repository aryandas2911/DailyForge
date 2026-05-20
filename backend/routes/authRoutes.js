import express from "express";
import { getUser, login, signup ,verifyOTP , logout } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

// router object for auth
export const authRouter = express.Router();

// Route for signup
authRouter.post("/signup", signup);

// To verify otp and create user
authRouter.post("/verify-otp", verifyOTP);

// Route for login
authRouter.post("/login", login);

// Route for get user (me)
authRouter.get("/me", authMiddleware, getUser);

// Route for logout
authRouter.post("/logout", logout);
