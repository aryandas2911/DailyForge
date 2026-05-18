import express from "express";
import { getUser, login, resend, signup, verifyUser } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { verifyOtp } from "../utils/emailVarification.js";

// router object for auth
export const authRouter = express.Router();

// Route for signup
authRouter.post("/signup", signup);

// Route for login
authRouter.post("/login", login);

// Route for get user (me)
authRouter.get("/me", authMiddleware, getUser);
authRouter.post("/verifyotp",verifyUser)
authRouter.post("/resend",resend)