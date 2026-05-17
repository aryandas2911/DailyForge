import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import api from "../api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/forgot-password", { email });
      setSuccess(res.data.message);
      
      // Store email for next step
      localStorage.setItem("resetEmail", email);
      
      // Redirect to OTP verification after 2 seconds
      setTimeout(() => {
        navigate("/verify-otp");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
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
        <h1 className="text-3xl font-bold text-main">Forgot Password</h1>
        <p className="text-sm text-main opacity-70">Enter your email to receive an OTP</p>
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
        <label htmlFor="email" className="text-sm font-medium text-main">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-main opacity-50" />
          <input
            type="email"
            id="email"
            className="
              w-full py-2.5 px-4 pl-12
              bg-surface-lighter border border-surface-border
              rounded-lg text-main
              focus:outline-none focus:border-main focus:ring-1 focus:ring-main
            "
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
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
        {loading ? "Sending OTP..." : "Send OTP"}
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

export default ForgotPassword;
