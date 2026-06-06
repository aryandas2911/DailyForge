import express from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
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

const RATE_LIMIT_MESSAGE = { message: 'Too many attempts, please try again later' };

const baseAuthLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: RATE_LIMIT_MESSAGE,
};

const normalizeEmail = (req) => String(req.body?.email ?? '').trim().toLowerCase();

// Max 10 auth attempts per IP per 15 minutes — caps credential stuffing / signup spam
const authByIpLimiter = rateLimit({
  ...baseAuthLimitOptions,
  max: 10,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
});

// Max 5 attempts per email per 15 minutes — protects individual accounts from brute-force
const authByEmailLimiter = rateLimit({
  ...baseAuthLimitOptions,
  max: 5,
  keyGenerator: (req) => normalizeEmail(req) || ipKeyGenerator(req.ip),
});

// Max 5 attempts per 15 minutes — prevents brute-force on TOTP codes
const twoFALimiter = rateLimit({
  ...baseAuthLimitOptions,
  max: 5,
});

// Public routes
router.post('/signup', authByIpLimiter, authByEmailLimiter, signup);
router.post('/login', authByIpLimiter, authByEmailLimiter, login);
router.post('/google-login', authByIpLimiter, googleLogin);

// 2FA login completion (rate limited — protects TOTP brute-force)
router.post('/login-2fa', twoFALimiter, loginWith2FA);

// Protected routes (require valid JWT)
router.get('/user', authMiddleware, getUser);
router.put('/update-profile', authMiddleware, updateProfile);
router.post('/logout', authMiddleware, logout);

// 2FA management routes (protected + rate limited)
router.post('/setup-2fa', authMiddleware, twoFALimiter, setup2FA);
router.post('/verify-2fa', authMiddleware, twoFALimiter, verify2FA);
router.post('/disable-2fa', authMiddleware, twoFALimiter, disable2FA);

export { router as authRouter };