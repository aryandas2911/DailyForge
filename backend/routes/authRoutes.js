import express from "express";
import { getUser, login, signup, logout } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { loginValidation, signupValidation, handleValidationErrors } from "../middlewares/validator.js";

// router object for auth
export const authRouter = express.Router();

// Route for signup
authRouter.post("/signup", signupValidation, handleValidationErrors, signup);

// Route for login
authRouter.post("/login", loginValidation, handleValidationErrors, login);

// Route for get user (me)
authRouter.get("/me", authMiddleware, getUser);

// Route for logout
authRouter.post("/logout", logout);
