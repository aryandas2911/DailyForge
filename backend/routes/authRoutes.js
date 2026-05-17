import express from "express";
import { getUser, login, signup } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

// router object for auth
export const authRouter = express.Router();

// Route for signup
authRouter.post("/signup", asyncHandler(signup));

// Route for login
authRouter.post("/login", asyncHandler(login));

// Route for get user (me)
authRouter.get("/me", authMiddleware, asyncHandler(getUser));
