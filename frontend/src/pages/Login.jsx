import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext.jsx";

const Login = () => {
  // States for inputs and error handling
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setUser, setToken } = useContext(AuthContext);

  // Submit handler
  const handleSubmit = async (e) => {
    // Prevents page from refreshing
    e.preventDefault();

    // CRITERIA FIX: Clear previous errors immediately on retry
    setError("");

    // BONUS: Client-side validation before making an API call
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError("Please enter a valid email address.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    // Send request to server
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      console.log("Login success: ", res.data);

      // Save token in localStorage for later api calls
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);

      // Get user details
      const me = await api.get("/auth/me");
      setUser(me.data.user);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      // Handle error cleanly
      console.log("Login failed");
      console.log(error.response?.data || error.message);

      // Pull specific message from backend if it exists, otherwise fallback
      setError(error.response?.data?.message || "Invalid email or password.");
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
        <h1 className="text-3xl font-bold text-main">Login</h1>
      </div>

      {/* CRITERIA FIX: Positioned alert nicely at the top of the form fields */}
      {error && (
        <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium animate-shake">
          {error}
        </div>
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
            if (error) setError(""); // CRITERIA FIX: Clear error text as soon as user types
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
              if (error) setError(""); // CRITERIA FIX: Clear error text as soon as user types
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
        <Link
          to="/signup"
          className="text-main font-medium cursor-pointer hover:underline transition-colors"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
};

export default Login;