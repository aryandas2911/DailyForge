import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext.jsx";

const Login = () => {
  // Input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Navigation
  const navigate = useNavigate();

  // Auth context
  const { setUser, setToken } = useContext(AuthContext);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Login request
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      // Save token
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);

      // Fetch user details
      const me = await api.get("/auth/me");
      setUser(me.data.user);

      // Redirect
      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Invalid email or password."
      );
    }
  };

  return (
    <form
      className="
        surface-bg px-10 py-12 rounded-2xl
        w-full max-w-md
        flex flex-col gap-6 animate-in
      "
      onSubmit={handleSubmit}
    >
      {/* Header */}
      <div className="text-center space-y-1 mb-3">
        <h1 className="text-3xl font-bold text-main">
          Login
        </h1>

        <p className="text-sm text-muted">
          Welcome back! Please sign in to continue.
        </p>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium text-main"
        >
          Email
        </label>

        <input
          type="email"
          id="email"
          value={email}
          autoComplete="email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          placeholder="user@email.com"
          required
          className="
            w-full px-3 py-2.5
            text-sm
            surface-bg
            border-soft
            rounded-sm
            shadow-xs
            input-focus
            hover-lift
            transition-all
          "
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-main"
        >
          Password
        </label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder="••••••••"
            required
            className="
              w-full px-3 py-2.5 pr-10
              text-sm
              surface-bg
              border-soft
              rounded-base
              shadow-xs
              input-focus
              hover-lift
              transition-all
            "
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              text-muted hover:text-main
              transition-colors cursor-pointer
              flex items-center justify-center
            "
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="
            px-3 py-2.5
            bg-red-50 dark:bg-red-900/20
            border border-red-200 dark:border-red-800
            rounded-base
            text-sm text-red-600 dark:text-red-400
          "
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="
          btn btn-primary
          cursor-pointer
          w-full mt-2
          hover-lift
          transition-all
        "
      >
        Login
      </button>

      {/* Footer */}
      <p className="text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="
            text-primary font-medium
            cursor-pointer
            hover:underline
            transition-colors
          "
        >
          Sign up
        </Link>
      </p>
    </form>
  );
};

export default Login;