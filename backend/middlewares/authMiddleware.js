import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    // ✅ Check header exists & format
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization failed, token missing or invalid format",
      });
    }

    // ✅ Extract token
    const token = authHeader.split(" ")[1];

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach user (clean + scalable)
    req.user = {
      id: decoded.id || decoded.userId,
    };

    next();
  } catch (error) {
    // ✅ Better logging (production-friendly)
    console.error("JWT Error:", error.message);

    // ✅ Specific error handling
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired, please log in again",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // ✅ Fallback (unexpected error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
