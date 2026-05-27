import { useState } from "react";
import api from "../api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const res = await api.post("/auth/forgot-password", {
        email,
      });

      setMessage(res.data.message);

      console.log("Reset URL:", res.data.resetUrl);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to generate password reset link"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="surface-bg p-8 rounded-3xl w-full max-w-md flex flex-col gap-5 border border-white/10"
      >
        <h1 className="text-3xl font-bold text-main text-center">
          Forgot Password
        </h1>

        <p className="text-sm text-muted text-center">
          Enter your email to receive a password reset link
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-2xl surface-bg border-soft"
        />

        {message && (
          <div className="text-green-500 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary py-3 rounded-2xl"
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;