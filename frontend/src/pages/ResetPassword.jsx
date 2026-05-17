import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Lock } from "lucide-react";
import api from "../api/axios";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verify user has completed previous steps
    const storedEmail = localStorage.getItem("resetEmail");
    const otpVerified = localStorage.getItem("otpVerified");

    if (!storedEmail || !otpVerified) {
      navigate("/forgot-password");
      return;
    }

    setEmail(storedEmail);
  }, [navigate]);

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(
        "Password must be at least 8 characters long, include an uppercase letter, a digit, and a special character"
      );
      return;
    }

    try {
      setLoading(true);

      // Get the OTP that was verified
      const verifiedOTP = localStorage.getItem("verifiedOTP");
      if (!verifiedOTP) {
        // If OTP is not stored, we need to get it from user or backend
        setError("OTP verification required. Please start over.");
        navigate("/forgot-password");
        return;
      }

      const res = await api.post("/auth/reset-password", {
        email,
        otp: verifiedOTP,
        newPassword,
      });

      setSuccess(res.data.message);

      // Clear localStorage
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("otpVerified");
      localStorage.removeItem("verifiedOTP");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="
        surface-bg px-10 py-15 rounded-2xl
        w-full max-w-sm
        flex flex-col gap-6 animate-in
      "
      onSubmit={handleSubmit}
    >
      <div className="text-center space-y-1 mb-3">
        <h1 className="text-3xl font-bold text-main">Reset Password</h1>
        <p className="text-sm text-main opacity-70">Enter your new password</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-500 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-main">
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-main opacity-50" />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            className="
              w-full py-2.5 px-4 pl-12 pr-12
              bg-surface-lighter border border-surface-border
              rounded-lg text-main
              focus:outline-none focus:border-main focus:ring-1 focus:ring-main
            "
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-main opacity-50 hover:opacity-100"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-main opacity-60 mt-1">
          Min 8 chars, 1 uppercase, 1 digit, 1 special character
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm-password" className="text-sm font-medium text-main">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-main opacity-50" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirm-password"
            className="
              w-full py-2.5 px-4 pl-12 pr-12
              bg-surface-lighter border border-surface-border
              rounded-lg text-main
              focus:outline-none focus:border-main focus:ring-1 focus:ring-main
            "
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-main opacity-50 hover:opacity-100"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="
          w-full bg-main text-white font-semibold py-3 rounded-lg
          hover:bg-main/90 active:scale-95
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>

      <div className="flex items-center gap-2 text-sm text-main opacity-70">
        <Link to="/login" className="flex items-center gap-2 hover:text-main transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </form>
  );
};

export default ResetPassword;
