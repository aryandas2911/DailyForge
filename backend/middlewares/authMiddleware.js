import jwt from 'jsonwebtoken';

const JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'HS256';

export const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Token format invalid" });
  }

<<<<<<< HEAD
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not configured');
    return res.status(500).json({
      success: false,
      message: 'Authentication service is misconfigured',
=======
  // check JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment variables");
    return res.status(500).json({
      success: false,
      message: "Server configuration error",
>>>>>>> upstream/main
    });
  }

  try {
<<<<<<< HEAD
    // verify token using jwt key and the designated algorithm from the main updates
=======
    // verify token using jwt key
>>>>>>> upstream/main
    const verify = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    });

    // attach payload id to request (handle both 'id' and 'userId' for backward compatibility)
    req.userId = verify.id || verify.userId;
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
<<<<<<< HEAD
};
=======
};
>>>>>>> upstream/main
