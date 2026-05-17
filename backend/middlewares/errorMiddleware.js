import AppError from "../utils/AppError.js";

/**
 * Global error handler — consistent JSON for thrown errors and async failures.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode =
    err instanceof AppError
      ? err.statusCode
      : err.statusCode && Number.isInteger(err.statusCode)
        ? err.statusCode
        : 500;

  const message =
    err instanceof AppError || statusCode < 500
      ? err.message || "Request failed"
      : "Internal Server Error";

  if (statusCode >= 500) {
    console.error("Unhandled error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && err.stack
      ? { stack: err.stack }
      : {}),
  });
};
