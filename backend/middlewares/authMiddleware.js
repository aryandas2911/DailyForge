import jwt from 'jsonwebtoken';

const JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'HS256';

export const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  // access the token from cookies
  let token = req.cookies?.token;

const authHeader = req.headers.authorization;

if (!token && authHeader?.startsWith('Bearer ')) {
  token = authHeader.split(' ')[1];
}

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Token format invalid" });
  }

  // Check if JWT_SECRET is configured properly
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment variables");
    return res.status(500).json({
      success: false,
      message: "Server configuration error",
    });
  }

  try {
    // Verify token using jwt key and the designated algorithm
    // verify token using jwt key


    const verify = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    });

    // Attach payload id to request (handle both 'id' and 'userId' for backward compatibility)
    req.userId = verify.id || verify.userId;
    next();
  } catch (error) {
    console.log('Token verification error', error);

    // Expired token
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired, please log in again',
      });
    } 
    
    // Invalid/tampered token
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    } 

    // Unexpected server error
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
