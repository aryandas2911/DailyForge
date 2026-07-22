import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'HS256';
  // access the token from cookies
  let token = req.cookies?.token;

  const authHeader = req.headers.authorization;

  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided, please log in" });
  }

  // check JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment variables");
    return res.status(500).json({
      success: false,
      message: "Server configuration error",
    });
  }

  try {
    // verify token using jwt key
    const verify = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    });

    // attach payload id to request (handle both 'id' and 'userId' for backward compatibility)
    req.userId = verify.id || verify.userId;
    
    // CSRF Protection: Require custom header for state-changing methods
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (!safeMethods.includes(req.method)) {
      if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
        return res.status(403).json({
          success: false,
          message: "CSRF protection: X-Requested-With header missing or invalid",
        });
      }
    }
    
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
