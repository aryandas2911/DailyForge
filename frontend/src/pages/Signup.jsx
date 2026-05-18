import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext.jsx";

const Signup = () => {
  // three states for inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // useNavigate object
  const navigate = useNavigate();

  // useContext for auth
  const { setUser } = useContext(AuthContext);

  // submit handler
  const handleSubmit = async (e) => {
    // prevents page from refreshing
    e.preventDefault();
    
    // clear any previous error messages
    setErrorMessage("");

    if (!validate()) return;
    // set loading state
    setIsLoading(true);
    setError("");

    // send request to server
    try {
      const res = await api.post("/auth/signup", {
        name,
        email,
        password,
      });
      console.log("Signup success: ", res.data);

      // get user details
      const me = await api.get("/auth/me");
      setUser(me.data.user);

      // redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
  console.log("Signup failed");

  const errorMessage =
    error.response?.data?.message || error.message || "Signup failed. Please try again.";

  console.log(errorMessage);

  // specific handling for duplicate user
  if (error.response?.status === 409) {
    setErrorMessage("An account with this email already exists. Please try logging in instead.");
  } else {
    setErrorMessage(errorMessage);
  }
} finally {
  setIsLoading(false);
}
  };

  const validate = () => {
    const newErrors = {};
    if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      newErrors.password = "Password: min 8 chars, 1 uppercase, 1 digit, 1 special character";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // signup component
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

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

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
            ${errors.name ? "border-red-500" : "border-soft"}
          `}
        />
        {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
      </div>

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
            input-focus hover-lift
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
              input-focus hover-lift
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
        {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-main">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
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
              input-focus hover-lift
            "
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors cursor-pointer flex items-center justify-center"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <span className="text-red-500 text-xs">{errors.confirmPassword}</span>
        )}
      </div>

      {error && (
        <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-sm text-sm text-red-600">
          {error}
        </div>
      )}

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
