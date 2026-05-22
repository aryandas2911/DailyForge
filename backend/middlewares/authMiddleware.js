import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Token format invalid" });
  }

  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = verify.id || verify.userId;
    next();
  } catch (error) {
    console.log("Token verification error", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired, please log in again",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  }
};