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

    // attach payload userid to request body
    req.userId = verify.userId;
    next();

  } catch (error) {
    // error handling
    console.log("Token verification error", error);
    return res.status(500).json({ success: false, message: "Token invalid" });
  }
};
