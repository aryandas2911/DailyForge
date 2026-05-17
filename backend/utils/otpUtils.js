import crypto from "crypto";

// Generate a 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate OTP expiry time (10 minutes from now)
export const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

// Validate OTP format
export const isValidOTP = (otp) => {
  return /^\d{6}$/.test(otp);
};
