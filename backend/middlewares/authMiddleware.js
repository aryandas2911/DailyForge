import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  // access the token from cookies
  const token = req.cookies?.token;
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

  }  catch (error) {
    //error handling
    // adding if else ladder 
  console.log("Token verification error", error);

  // if statement for when the token is expired
  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Session expired, please log in again",
    });
    //if statement for when the token is invalid

  } else if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });

    // returning 500 for unexected auth error

  } else {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
};
