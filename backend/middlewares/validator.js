import { body, validationResult } from "express-validator";

// Signup validation
export const signupValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required"),

  body("email")
    .isEmail()
    .withMessage("Valid email is required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// Login validation
export const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// Task validation
export const taskValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required"),

  body("priority")
    .notEmpty()
    .withMessage("Priority is required"),

  body("status")
    .notEmpty()
    .withMessage("Status is required"),
];

// Routine validation
export const routineValidation = [
  body("name")
    .notEmpty()
    .withMessage("Routine name is required"),

  body("items")
    .isArray({ min: 1 })
    .withMessage("Items array cannot be empty"),
];

// Common validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  next();
};