import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import useAuthStore from "../store/authStore";

const Login = () => {
  // two states for inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // useNavigate object
  const navigate = useNavigate();

  // useAuthStore for auth
  const login = useAuthStore((state) => state.login);

  // submit handler
  const handleSubmit = async (e) => {
    // prevents page from refreshing
    e.preventDefault();
    setError("");

    // send request via store
    const result = await login({ email, password });
    
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
      console.log("Login failed:", result.message);
    }
  };

  // login component
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
        <h1 className="text-3xl font-bold text-main">Login</h1>
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg border border-red-100">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-main">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
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
          "
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-main">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
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
            "
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

      <button
        type="submit"
        className="btn btn-primary cursor-pointer w-full mt-2 hover-lift"
      >
        Login
      </button>

      <p className="text-center text-sm text-muted">
        Don't have an account?{" "}
        <span
          onClick={() => {
            navigate("/signup");
          }}
          className="text-main font-medium cursor-pointer hover:underline transition-colors"
        >
          Sign up
        </span>
      </p>
    </form>
  );
};

export default Login;
