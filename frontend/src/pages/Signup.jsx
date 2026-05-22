import { useContext, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext.jsx";
import { auth, googleProvider } from "../utils/firebase";
import { signInWithPopup } from "firebase/auth";

// Google Icon
const GoogleIcon = () => (
  <svg
    className="w-5 h-5 mr-2.5 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

// Loading Spinner
const LoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2.5 h-5 w-5 text-current"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 
      0 0 5.373 0 12h4zm2 
      5.291A7.962 7.962 0 014 
      12H0c0 3.042 1.135 5.824 
      3 7.938l3-2.647z"
    />
  </svg>
);

const Signup = () => {
  // Tilt
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transition = "transform 0.1s ease-out";
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    card.style.transition = "transform 0.4s ease-out";
    card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)`;
  };

  // Auth State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  // Google Login
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage("");
    try {
      localStorage.removeItem("token");
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await api.post("/auth/google", { idToken });
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/popup-closed-by-user") {
        setErrorMessage("Sign-in popup closed before completion. Please try again.");
      } else {
        setErrorMessage(
          err.response?.data?.message ||
            err.message ||
            "Failed to authenticate with Google."
        );
      }
    } finally {
      setIsGoogleLoading(false);
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

  // Email Signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!validate()) return;
    setIsLoading(true);
    try {
      localStorage.removeItem("token");
      await api.post("/auth/signup", { name, email, password });
      const me = await api.get("/auth/me");
      setUser(me.data.user);
      navigate("/dashboard");
    } catch (error) {
      if (error.response?.status === 409) {
        setErrorMessage("An account with this email already exists. Please try logging in instead.");
      } else {
        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "Signup failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="
        auth-page-bg
        min-h-screen
        w-full
        flex
        items-center
        justify-center
        px-6
        py-10
        overflow-hidden
        relative
      "
    >
      {/* Glow blobs */}
      <div className="absolute top-[-120px] left-[-80px] w-[340px] h-[570px] rounded-full bg-indigo-500/20 blur-3xl"></div>

      <div className="absolute bottom-[-140px] right-[-80px] w-[550px] h-[350px] rounded-full bg-sky-500/20 blur-3xl"></div>
      
      <div className="absolute top-[-140px] right-[-80px] w-[550px] h-[350px] rounded-full bg-violet-500/20 blur-3xl"></div>

      {/* Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="
          relative
          z-10
          w-full
          max-w-md
          will-change-transform
          transform-gpu
        "
      >
        <form
          onSubmit={handleSubmit}
          className="
            surface-bg
            animate-in
            w-full
            rounded-[30px]
            px-8
            py-10
            flex
            flex-col
            gap-3
            mt-[-3rem]
            border
            border-white/10
            shadow-[0_20px_60px_rgba(0,0,0,0.7)]
          "
        >
          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-main">
              Create Account
            </h1>

            <p className="text-sm text-muted">
              Sign up to get started
            </p>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="
              flex items-center justify-center
              w-full
              px-4 py-3
              rounded-2xl
              border border-soft
              bg-white/70
              dark:bg-slate-900/50
              text-slate-700
              dark:text-slate-100
              font-medium
              transition-all duration-200
              hover:-translate-y-[1px]
              hover:shadow-md
              disabled:opacity-50
              cursor-pointer
            "
          >
            {isGoogleLoading ? (
              <LoadingSpinner />
            ) : (
              <GoogleIcon />
            )}
            {isGoogleLoading
              ? "Connecting..."
              : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center">
            <div className="flex-1 h-px bg-white/20"></div>

            <span className="px-4 text-xs font-semibold tracking-[0.2em] uppercase text-muted">
              OR
            </span>

            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* Error */}
          {errorMessage && (
            <div
              className="
                px-4 py-3
                rounded-2xl
                text-sm
                border
                bg-red-500/10
                border-red-500/20
                text-red-500
              "
            >
              {errorMessage}
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-main"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="
                input-modern
                w-full
                px-4
                py-3
                rounded-2xl
                text-sm
              "
            />
            {errors.name && (
              <span className="text-red-500 text-xs">{errors.name}</span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-main"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="user@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                input-modern
                w-full
                px-4
                py-3
                rounded-2xl
                text-sm
              "
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
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
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  input-modern
                  w-full
                  px-4
                  py-3
                  pr-11
                  rounded-2xl
                  text-sm
                "
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-muted
                  hover:text-main
                  transition-colors
                  cursor-pointer
                "
              >
                {showPassword ? (
                  <Eye size={18} />
                ) : (
                  <EyeOff size={18} />
                )}
              </button>
            </div>
            {errors.password && (
              <span className="text-red-500 text-xs">{errors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-main"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="
                  input-modern
                  w-full
                  px-4
                  py-3
                  pr-11
                  rounded-2xl
                  text-sm
                "
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-muted
                  hover:text-main
                  transition-colors
                  cursor-pointer
                "
              >
                {showConfirmPassword ? (
                  <Eye size={18} />
                ) : (
                  <EyeOff size={18} />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-red-500 text-xs">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="
              btn btn-primary
              w-full
              py-3
              rounded-2xl
              cursor-pointer
              disabled:opacity-50
            "
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="
                text-main
                font-semibold
                hover:underline
              "
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;