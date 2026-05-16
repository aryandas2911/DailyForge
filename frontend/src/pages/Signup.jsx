import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext.jsx";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { setUser, setToken } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/signup", { name, email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      const me = await api.get("/auth/me");
      setUser(me.data.user);
      navigate("/dashboard");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Signup failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ios-glass-theme app-bg min-h-screen w-full flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="card glass-panel w-full max-w-lg flex flex-col gap-5 animate-in"
      >
        {/* Logo + Title */}
        <div className="flex flex-col items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4eb7b3] to-[#98e1d7] flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-2xl leading-none">D</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-main">Create account</h1>
            <p className="text-sm text-muted mt-0.5">Join DailyForge today</p>
          </div>
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-main">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            required
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/60 bg-white/40 backdrop-blur-sm text-main placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-[#4eb7b3]/40 focus:border-[#4eb7b3] transition-all"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-main">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@email.com"
            required
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/60 bg-white/40 backdrop-blur-sm text-main placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-[#4eb7b3]/40 focus:border-[#4eb7b3] transition-all"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-main">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2.5 pr-10 text-sm rounded-xl border border-white/60 bg-white/40 backdrop-blur-sm text-main placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-[#4eb7b3]/40 focus:border-[#4eb7b3] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors cursor-pointer flex items-center justify-center"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="glass-cell px-3 py-2.5 rounded-xl text-sm text-red-600 border border-red-200/60">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full mt-1 hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing up…" : "Sign Up"}
        </button>

        {/* Footer link */}
        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-main font-medium cursor-pointer hover:underline transition-colors"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Signup;
