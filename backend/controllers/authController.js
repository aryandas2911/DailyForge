import User from '../src/models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { verifyFirebaseIdToken } from '../utils/firebaseAuth.js';
import crypto from 'crypto';

const JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'HS256';
const AUTH_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

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

// sign up function
export const signup = async (req, res) => {
  try {
    // fetch values from request
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2) {
      return res
        .status(400)
        .json({ message: 'Name must be at least 2 characters long' });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long, include an uppercase letter, a digit, and a special character',
      });
    }

    // check user exists or not
    const checkExisting = await User.findOne({ email });
    if (checkExisting) {
      return res.status(409).json({ message: 'User already exists' });
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

    // check if email and password exist in request
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    // check if user exists or not
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" }); // ✅ fixed
    }

    // check password using bcrypt
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return res.status(401).json({ message: "Invalid email or password" }); // ✅ fixed
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
    return res.status(500).json({ message: "Error fetching user data", success: false });
  }
};
