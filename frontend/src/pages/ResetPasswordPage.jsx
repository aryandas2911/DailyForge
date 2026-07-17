import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import FormError from "../components/common/FormError";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Password reset token is missing.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!token) {
      setError("Password reset token is missing.");
      return;
    }

    if (!newPassword || !confirmNewPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError(
        "Password must be at least 8 characters long, include an uppercase letter, a digit, and a special character."
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        token,
        newPassword,
        confirmNewPassword,
      });
      setSuccessMessage(res.data.message || "Password reset successfully!");
      setTimeout(() => {
        navigate("/login"); // Redirect to login page after a short delay
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-bg min-h-[calc(100vh-3.75rem)] w-full flex items-center justify-center px-6 pt-10 pb-24 md:pb-32 overflow-hidden relative">
      <div className="absolute top-[-120px] left-[-80px] w-[340px] h-[570px] rounded-full bg-indigo-500/20 blur-3xl"></div>
      <div className="absolute bottom-[-140px] right-[-80px] w-[550px] h-[350px] rounded-full bg-sky-500/20 blur-3xl"></div>
      <div className="absolute top-[-140px] right-[-80px] w-[550px] h-[350px] rounded-full bg-violet-500/20 blur-3xl"></div>
      <div className="relative z-10 w-full max-w-md animate-in-slow">
        <form onSubmit={handleSubmit} className="surface-bg hover-lift w-full rounded-[30px] px-8 py-10 flex flex-col gap-6 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-main">
              Reset Password
            </h1>
            <p className="text-sm text-muted">
              Enter your new password
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="newPassword" className="text-sm font-medium text-main">New Password</label>
            <div className="relative">
              <input type={showNewPassword ? "text" : "password"} id="newPassword" placeholder="••••••••" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-modern w-full px-4 py-3 pr-11 rounded-2xl text-sm border-1 border-slate-200" />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors cursor-pointer">
                {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmNewPassword" className="text-sm font-medium text-main">Confirm New Password</label>
            <div className="relative">
              <input type={showConfirmNewPassword ? "text" : "password"} id="confirmNewPassword" placeholder="••••••••" required value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="input-modern w-full px-4 py-3 pr-11 rounded-2xl text-sm border-1 border-slate-200" />
              <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors cursor-pointer">
                {showConfirmNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
          
          <FormError error={error} />
          {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}
          
          <button type="submit" disabled={isLoading} className="btn btn-primary w-full py-3 mt-1 rounded-2xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover-lift">
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
          <p className="text-center text-sm text-muted">
            Remembered your password?{" "}
            <Link to="/login" className="text-main font-semibold hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;