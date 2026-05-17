/**
 * Structured application error with HTTP status for the global error handler.
 */
export default class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
