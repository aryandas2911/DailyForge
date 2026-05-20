import jwt from "jsonwebtoken";
import User from "../src/models/User.js";

export const authMiddleware = async (req, res, next) => {
  // access the authorization header from the request
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization error, token not present",
    });
  }

  // access token from authorization header
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Token format invalid" });
  }

  try {
    // verify token using jwt key
    const verify = jwt.verify(token, process.env.JWT_SECRET);

    // attach payload id to request (handle both 'id' and 'userId' for backward compatibility)
    req.userId = verify.id || verify.userId;

    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    req.user = user;
    next();

  } catch (error) {
    // error handling
    console.log("Token verification error", error);

    // expired token
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired, please log in again",
      });
    }

    // invalid/tampered token
    return res.status(401).json({
      success: false,
      message: "Token invalid",
    });
  }
};
