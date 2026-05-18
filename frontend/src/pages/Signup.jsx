import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext.jsx";

const Signup = () => {
  // Input states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Error handling states
  const [errors, setErrors] = useState({}); // Field-specific validation errors
  const [error, setError] = useState("");    // Global/API errors
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { setUser, setToken } = useContext(AuthContext);

  // Client-side form validation
  const validate = () => {
    const newErrors = {};

    if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      newErrors.password = "Min 8 chars, 1 uppercase, 1 digit, 1 special char.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // CRITERIA FIX: Clear all previous error states instantly on click/retry
    setError("");
    setErrors({});

    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await api.post("/auth/signup", {
        name,
        email,
        password,
      });
      console.log("Signup success: ", res.data);

      // Save token in localStorage for later api calls
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);

      // Get user details
      const me = await api.get("/auth/me");
      setUser(me.data.user);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.log("Signup failed");
      const errorMessage = error.response?.data?.message || error.message || "Signup failed. Please try again.";
      setError(errorMessage);
      console.log(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="
        surface-bg px-10 py-15 rounded-2xl
        w-full max-w-sm
        flex flex-col gap-6
        animate-in
      "
      onSubmit={handleSubmit}
    >
      <div className="text-center space-y-1 mb-3">
        <h1 className="text-3xl font-bold text-main">Signup</h1>
      </div>

      {/* Global API Error Alert Banner */}
      {error && (
        <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Name Field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-main">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" })); // CRITERIA FIX: Erase error text on type
          }}
          placeholder="Full Name"
          required
          className={`
            w-full px-3 py-2.5
            text-sm
            surface-bg
            rounded-sm
            shadow-xs
            input-focus hover-lift
            ${errors.name ? "border-red-500 text-red-600 focus:border-red-500 focus:ring-red-500" : "border-soft"}
          `}
        />
        {errors.name && <span className="text-red-500 text-xs font-medium">{errors.name}</span>}
      </div>

      {/* Email Field */}
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
            if (errors.email) setErrors((prev) => ({ ...prev, email: "" })); // CRITERIA FIX: Erase error text on type
          }}
          placeholder="user@email.com"
          required
          className={`
            w-full px-3 py-2.5
            text-sm
            surface-bg
            rounded-sm
            shadow-xs
            input-focus hover-lift
            ${errors.email ? "border-red-500 text-red-600 focus:border-red-500 focus:ring-red-500" : "border-soft"}
          `}
        />
        {errors.email && <span className="text-red-500 text-xs font-medium">{errors.email}</span>}
      </div>

      {/* Password Field — FIXED THE DUPLICATE INPUT BUG HERE */}
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
              if (errors.password) setErrors((prev) => ({ ...prev, password: "" })); // CRITERIA FIX: Erase error text on type
            }}
            placeholder="••••••••"
            required
            className={`
              w-full px-3 py-2.5 pr-10
              text-sm
              surface-bg
              rounded-base
              shadow-xs
              input-focus hover-lift
              ${errors.password ? "border-red-500 text-red-600 focus:border-red-500 focus:ring-red-500" : "border-soft"}
            `}
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
        {errors.password && <span className="text-red-500 text-xs font-medium">{errors.password}</span>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary cursor-pointer w-full mt-2 hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Signing up..." : "Sign Up"}
      </button>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-main font-medium cursor-pointer hover:underline transition-colors"
        >
          Login
        </Link>
      </p>
    </form>
  );
};

export default Signup;