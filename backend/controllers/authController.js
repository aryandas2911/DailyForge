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

    const checkExisting = await User.findOne({ email });
    if (checkExisting) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

<<<<<<< HEAD
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
=======
    const jwtSecret = getJwtSecret(res);
    if (!jwtSecret) {
      return;
    }

    // generate token using jwt
    const token = jwt.sign({ userId: newUser._id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      algorithm: JWT_ALGORITHM,
>>>>>>> upstream/main
    });

    return res
      .status(201)
<<<<<<< HEAD
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({ 
        message: 'User registered successfully',
        user: { _id: newUser._id, name: newUser.name, email: newUser.email }
=======
      .cookie('token', token, getAuthCookieOptions())
      .json({
        message: 'User registered successfully',
        user: { _id: newUser._id, name: newUser.name, email: newUser.email },
>>>>>>> upstream/main
      });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error during signup' });
  }
};

// login function
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(409).json({ message: 'User does not exist' });
    }

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return res.status(401).json({ message: 'Password does not match' });
    }

<<<<<<< HEAD
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
=======
    const jwtSecret = getJwtSecret(res);
    if (!jwtSecret) {
      return;
    }

    // generate jwt token
<<<<<<< HEAD
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      algorithm: JWT_ALGORITHM,
>>>>>>> upstream/main
=======
    // check JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
>>>>>>> f7238668798b640f3700b93057f6998a20db95c1
    });

    return res
      .status(200)
<<<<<<< HEAD
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({ 
        message: 'Login successful',
        user: { _id: user._id, name: user.name, email: user.email }
=======
      .cookie('token', token, getAuthCookieOptions())
      .json({
        message: 'Login successful',
        user: { _id: user._id, name: user.name, email: user.email },
>>>>>>> upstream/main
      });
  } catch (error) {
    console.log('Login error: ', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// access user details function
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user: user });
  } catch (_error) {
    return res
      .status(500)
      .json({ message: 'Error fetching user data', success: false });
  }
};

// update profile function with unique name validation task
export const updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // UNIQUE USERNAME VALIDATION TASK
    if (name && name !== user.name) {
      if (name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Name must be at least 2 characters long',
        });
      }

      const existingUser = await User.findOne({ name: name });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken. Please choose another one.',
        });
      }

      user.name = name;
    }

    if (currentPassword && newPassword) {
      const passwordCheck = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!passwordCheck) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

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
    if (!email) {
      return res.status(400).json({ message: 'Email is missing from the Google identity token' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = new User({
        name: name || email.split('@')[0],
        email,
        password: hashedPassword,
      });

      await user.save();
    }

<<<<<<< HEAD
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
=======
    // Generate JWT token (matches standard custom auth format)
    const jwtSecret = getJwtSecret(res);
    if (!jwtSecret) {
      return;
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret, {
>>>>>>> upstream/main
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      algorithm: JWT_ALGORITHM,
    });

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
    console.error('[GOOGLE AUTH] Controller error:', error);
    return res.status(500).json({ message: 'Server error during Google authentication' });
  }
};