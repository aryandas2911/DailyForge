import express from "express";
import rateLimit from "express-rate-limit";

import {
  getUser,
  login,
  signup,
  updateProfile,
  logout,
  googleLogin,
  deleteProfile,
} from "../controllers/authController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  message: "Too many requests, please try again later",
});

// router object for auth
export const authRouter = express.Router();

// Route for signup
authRouter.post("/signup", authLimiter, signup);

// Route for login
authRouter.post("/login", authLimiter, login);

// Route for Google login
authRouter.post("/google", authLimiter, googleLogin);

// Route for deleting profile
authRouter.delete("/delete-profile", authMiddleware, deleteProfile);

authRouter.get('/me', authMiddleware, getUser);

// Route for profile update
authRouter.patch('/profile', authMiddleware, updateProfile);

// Route for logout
authRouter.post('/logout', logout);

