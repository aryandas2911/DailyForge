import jwt from 'jsonwebtoken';
import User from '../src/models/User.js';

const JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'HS256';

export const authMiddleware = async (req, res, next) => {
  // access the token from cookies
  const token = req.cookies?.token;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication error, token not present" });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not configured');
    return res.status(500).json({
      success: false,
      message: 'Authentication service is misconfigured',
    });
  }

  try {
    // verify token using jwt key
    const verify = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    });

    // attach payload id to request (handle both 'id' and 'userId' for backward compatibility)
    const userId = verify.id || verify.userId;

    // verify user exists in database
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or account deactivated",
      });
    }

    req.user = user;
    req.userId = user._id;
    next();

  } catch (error) {
    // error handling
    console.log('Token verification error', error);

    // expired token
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired, please log in again',
      });

      // invalid/tampered token
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });

      // unexpected server error
    } else {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
};

