import jwt from "jsonwebtoken";
import Routine from "../src/models/Routine.js";

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

// middleware for checking routine view access
export const canViewRoutine = async (req, res, next) => {
  try {
    // fetch routine from database
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: "Routine not found",
      });
    }

    // check if user owns the routine
    const isOwner = routine.userId.toString() === req.userId;

    // check if routine is shared with user
    const isSharedUser = routine.sharedWith.some(
      (share) => share.userId.toString() === req.userId
    );

    if (!isOwner && !isSharedUser) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // attach routine to request
    req.routine = routine;

    next();

  } catch (error) {
    // error handling
    console.log("Routine access error", error);

    return res.status(500).json({
      success: false,
      message: "Error validating routine access",
    });
  }
};

// middleware for checking routine edit access
export const canEditRoutine = async (req, res, next) => {
  try {
    // fetch routine from database
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: "Routine not found",
      });
    }

    // check if user owns the routine
    const isOwner = routine.userId.toString() === req.userId;

    // check if user has editor access
    const hasEditorAccess = routine.sharedWith.some(
      (share) =>
        share.userId.toString() === req.userId &&
        share.permission === "editor"
    );

    if (!isOwner && !hasEditorAccess) {
      return res.status(403).json({
        success: false,
        message: "Edit access denied",
      });
    }

    // attach routine to request
    req.routine = routine;

    next();

  } catch (error) {
    // error handling
    console.log("Routine edit access error", error);

    return res.status(500).json({
      success: false,
      message: "Error validating routine edit access",
    });
  }
};