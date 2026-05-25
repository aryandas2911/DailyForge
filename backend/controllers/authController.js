import User from '../src/models/User.js';
import jwt from 'jsonwebtoken';
import { verifyFirebaseIdToken } from '../utils/firebaseAuth.js';
import crypto from 'crypto';

const JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'HS256';
const AUTH_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;
const normalizeEmail = (email) => email?.trim().toLowerCase();

const getJwtSecret = (res) => {
  if (!process.env.JWT_SECRET) {
    res.status(500).json({ message: 'Authentication service is misconfigured' });
    return null;
  }

  return process.env.JWT_SECRET;
};

const getAuthCookieOptions = () => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE,
  };

  const cookieDomain = process.env.AUTH_COOKIE_DOMAIN || process.env.COOKIE_DOMAIN;
  if (cookieDomain) {
    cookieOptions.domain = cookieDomain;
  }

  return cookieOptions;
};

const getValidationErrorResponse = (error) => {
  if (error?.code === 11000) {
    return { status: 409, message: 'User already exists' };
  }

  if (error?.name === 'ValidationError') {
    return {
      status: 400,
      message: Object.values(error.errors)
        .map(({ message }) => message)
        .join(', '),
    };
  }

  return null;
};

// sign up function
export const signup = async (req, res) => {
  try {
    // fetch values from request
    const { name, email, password, confirmPassword } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!confirmPassword) {
      return res.status(400).json({ message: 'Confirm password is required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // check user exists or not
    const checkExisting = normalizedEmail
      ? await User.findOne({ email: normalizedEmail })
      : null;
    if (checkExisting) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // create new user document
    const newUser = new User({
      name,
      email: normalizedEmail,
      password,
    });

    // save the new user in database
    await newUser.save();

    const jwtSecret = getJwtSecret(res);
    if (!jwtSecret) {
      return;
    }

    // generate token using jwt
    const token = jwt.sign({ userId: newUser._id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      algorithm: JWT_ALGORITHM,
    });

    return res
      .status(201)
      .cookie('token', token, getAuthCookieOptions())
      .json({
        message: 'User registered successfully',
        user: { _id: newUser._id, name: newUser.name, email: newUser.email },
      });
  } catch (error) {
    const validationError = getValidationErrorResponse(error);
    if (validationError) {
      return res
        .status(validationError.status)
        .json({ message: validationError.message });
    }

    // error handling
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error during signup' });
  }
};

// login function
export const login = async (req, res) => {
  try {
    // fetch user data from request
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // check if email and password exist in request
    if (!normalizedEmail || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    // check if user exists or not
    const user = await User.findOne({ email: normalizedEmail }).select(
      '+password'
    );
    if (!user) {
      return res.status(409).json({ message: 'User does not exist' });
    }

    // check password using model helper
    const passwordCheck = await user.comparePassword(password);
    if (!passwordCheck) {
      return res.status(401).json({ message: 'Password does not match' });
    }

    const jwtSecret = getJwtSecret(res);
    if (!jwtSecret) {
      return;
    }

    // generate jwt token
    // check JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    return res
      .status(200)
      .cookie('token', token, getAuthCookieOptions())
      .json({
        message: 'Login successful',
        user: { _id: user._id, name: user.name, email: user.email },
      });
  } catch (error) {
    // error handling
    console.log('Login error: ', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// access user details function
export const getUser = async (req, res) => {
  try {
    // fetch user data from request
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user: user });
  } catch (_error) {
    // error handling
    return res
      .status(500)
      .json({ message: 'Error fetching user data', success: false });
  }
};

// update profile function
export const updateProfile = async (req, res) => {
  try {
    // fetch values from request body
    const { name, currentPassword, newPassword } = req.body;

    // fetch current user and include password for verification
    const user = await User.findById(req.userId).select('+password');

    // check user exists or not
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // update name if provided
    if (name) {
      user.name = name;
    }

    // update password if provided
    if (currentPassword && newPassword) {
      // compare current password
      const passwordCheck = await user.comparePassword(currentPassword);

      // check password matches or not
      if (!passwordCheck) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      // Let the schema pre-save hook hash the new password.
      user.password = newPassword;
    }

    // save updated user
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    const validationError = getValidationErrorResponse(error);
    if (validationError) {
      return res.status(validationError.status).json({
        success: false,
        message: validationError.message,
      });
    }

    // error handling
    console.log('Profile update error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
    });
  }
};

// logout function
export const logout = (req, res) => {
  res.clearCookie('token', getAuthCookieOptions());
  return res.status(200).json({ message: 'Logout successful' });
};

// Google Authentication Login & Register
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID Token is required' });
    }

    // Verify the Firebase ID Token using Google public keys
    let decodedToken;
    try {
      decodedToken = await verifyFirebaseIdToken(idToken);
    } catch (verifyError) {
      return res.status(401).json({ 
        message: 'Invalid or expired Firebase token', 
        error: verifyError.message 
      });
    }

    const { email, name } = decodedToken;
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is missing from the Google identity token' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Generate a password that satisfies the schema rules for
      // users created via Google authentication.
      const randomPassword = `GoogleAuth1!${crypto.randomBytes(16).toString(
        'hex'
      )}`;

      user = new User({
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: randomPassword,
      });

      await user.save();
      console.log(
        `[GOOGLE AUTH] Created new user profile for: ${normalizedEmail}`
      );
    } else {
      console.log(`[GOOGLE AUTH] Logged in existing user: ${normalizedEmail}`);
    }

    // Generate JWT token (matches standard custom auth format)
    const jwtSecret = getJwtSecret(res);
    if (!jwtSecret) {
      return;
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      algorithm: JWT_ALGORITHM,
    });

    // Write token to HTTP-Only Cookie
    return res
      .status(200)
      .cookie('token', token, getAuthCookieOptions())
      .json({
        message: 'Google sign-in successful',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      });
  } catch (error) {
    const validationError = getValidationErrorResponse(error);
    if (validationError) {
      return res
        .status(validationError.status)
        .json({ message: validationError.message });
    }

    console.error('[GOOGLE AUTH] Controller error:', error);
    return res.status(500).json({ message: 'Server error during Google authentication' });
  }
};

