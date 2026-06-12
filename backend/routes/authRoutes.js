import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  signup,
  login,
  loginWith2FA,
  setup2FA,
  verify2FA,
  disable2FA,
  getUser,
  updateProfile,
  logout,
  googleLogin,
} from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ─── Rate limiter for all 2FA endpoints ───────────────────────────────────────
// Max 5 attempts per 15 minutes — prevents brute-force on TOTP codes
const twoFALimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later' },
});
// ──────────────────────────────────────────────────────────────────────────────

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/google-login', googleLogin);

// 2FA login completion (rate limited — protects TOTP brute-force)
router.post('/login-2fa', twoFALimiter, loginWith2FA);

// Protected routes (require valid JWT)
router.get('/me', authMiddleware, getUser);
router.put('/update-profile', authMiddleware, updateProfile);
router.post('/logout', authMiddleware, logout);

// 2FA management routes (protected + rate limited)
router.post('/setup-2fa', authMiddleware, twoFALimiter, setup2FA);
router.post('/verify-2fa', authMiddleware, twoFALimiter, verify2FA);
router.post('/disable-2fa', authMiddleware, twoFALimiter, disable2FA);

export { router as authRouter };