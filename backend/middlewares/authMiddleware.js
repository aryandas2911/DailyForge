import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  // access the authorization header from the request
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization error, token not present",
    });
  }

  // check Bearer format
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token format invalid. Use: Bearer <token>",
    });
  }

  // access token from authorization header
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Token format invalid" });
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
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    // attach payload userid to request body
    req.userId = verify.userId;
    next();
  } catch (error) {
    console.log("Token verification error", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired, please login again" });
    }
    return res.status(401).json({ success: false, message: "Token invalid" });
  }
};