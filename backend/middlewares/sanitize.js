import mongoSanitize from "express-mongo-sanitize";

/**
 * NoSQL Injection Protection Middleware for Express v5.
 * Bypasses read-only getters safely using Object.defineProperty.
 */
const sanitizeMiddleware = (req, res, next) => {
  // 1. Sanitize request body in-place
  if (req.body) {
    mongoSanitize.sanitize(req.body);
  }

  // 2. Safely clone, sanitize, and redefine read-only req.query
  if (req.query) {
    const sanitizedQuery = structuredClone(req.query);
    mongoSanitize.sanitize(sanitizedQuery);
    
    Object.defineProperty(req, "query", {
      value: sanitizedQuery,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }

  // 3. Sanitize route params in-place
  if (req.params) {
    mongoSanitize.sanitize(req.params);
  }

  next();
};

export default sanitizeMiddleware;