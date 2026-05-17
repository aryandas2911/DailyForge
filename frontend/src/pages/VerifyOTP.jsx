import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, ArrowLeft, RefreshCw } from "lucide-react";
import api from "../api/axios";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem("resetEmail");
    if (!storedEmail) {
      navigate("/forgot-password");
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(interval);
    }
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/verify-otp", { email, otp });
      setSuccess(res.data.message);

      // Store OTP verification for next step
      localStorage.setItem("otpVerified", "true");
      localStorage.setItem("verifiedOTP", otp);

      // Redirect to reset password after 2 seconds
      setTimeout(() => {
        navigate("/reset-password");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");

    try {
      setResendLoading(true);
      await api.post("/auth/forgot-password", { email });
      setSuccess("OTP resent successfully!");
      setTimer(60); // 60 second cooldown
      setOtp("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResendLoading(false);
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
        <h1 className="text-3xl font-bold text-main">Verify OTP</h1>
        <p className="text-sm text-main opacity-70">Enter the 6-digit OTP sent to your email</p>
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
        <label htmlFor="otp" className="text-sm font-medium text-main">
          OTP Code
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-main opacity-50" />
          <input
            type="text"
            id="otp"
            className="
              w-full py-2.5 px-4 pl-12
              bg-surface-lighter border border-surface-border
              rounded-lg text-main text-center text-2xl tracking-widest
              focus:outline-none focus:border-main focus:ring-1 focus:ring-main
              font-mono
            "
            placeholder="000000"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setOtp(value);
            }}
            disabled={loading}
            maxLength="6"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="
          w-full bg-main text-white font-semibold py-3 rounded-lg
          hover:bg-main/90 active:scale-95
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <div className="flex items-center justify-center gap-2 text-sm">
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={resendLoading || timer > 0}
          className="
            flex items-center gap-2 text-main hover:text-main/80
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <RefreshCw className="w-4 h-4" />
          {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-main opacity-70">
        <Link to="/forgot-password" className="flex items-center gap-2 hover:text-main transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>
    </form>
  );
};

export default VerifyOTP;
