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
    })
  }
};
