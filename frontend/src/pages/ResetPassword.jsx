import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await api.post(`/auth/reset-password/${token}`, {
        password,
      });

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="surface-bg p-8 rounded-3xl w-full max-w-md flex flex-col gap-5 border border-white/10"
      >
        <h1 className="text-3xl font-bold text-main text-center">
          Reset Password
        </h1>

       <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Enter new password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    className="w-full px-4 py-3 pr-11 rounded-2xl surface-bg border-soft"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-main"
  >
    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
  </button>
</div>

        {message && <div className="text-green-500 text-sm">{message}</div>}
        {error && <div className="text-red-500 text-sm">{error}</div>}

        <button type="submit" className="btn btn-primary py-3 rounded-2xl">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;