import { useContext, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext.jsx";
import { auth, googleProvider } from "../utils/firebase";
import { signInWithPopup } from "firebase/auth";

// Colored Google SVG Icon
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

// Loading Spinner for Google login state
const LoadingSpinner = () => (
  <svg className="animate-spin -ml-1 mr-2.5 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const Login = () => {
  // two states for inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // useNavigate object
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || "/dashboard";

  // useContext for auth
  const { setUser } = useContext(AuthContext);

  // Google Login popup-based handler
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      localStorage.removeItem("token");
      
      // 1. Authenticate with Google
      const result = await signInWithPopup(auth, googleProvider);
      
      // 2. Fetch JWT ID Token from Firebase User
      const idToken = await result.user.getIdToken();
      
      // 3. Post Token to backend API
      const res = await api.post("/auth/google", { idToken });
      console.log("Google login success:", res.data);
      
      // 4. Update the global auth state
      setUser(res.data.user);
      
      // 5. Navigate to redirect location
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Google login failed:", err);
      // Handle user cancellation gracefully without noise
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup closed before completion. Please try again.");
      } else {
        setError(err.response?.data?.message || err.message || "Failed to log in with Google.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // submit handler
  const handleSubmit = async (e) => {
    // prevents page from refreshing
    e.preventDefault();
    setIsSubmitLoading(true);
    setError("");

    // send request to server
    try {
      localStorage.removeItem("token");

      const res = await api.post("/auth/login", {
        email,
        password,
      });
      console.log("Login success: ", res.data);

      // get user details
      const me = await api.get("/auth/me");
      setUser(me.data.user);

      // redirect to the requested protected page
      navigate(redirectPath, { replace: true });
    } catch (error) {
      // handle error
      console.log("Login failed");
      console.log(error.response?.data || error.message);
      setError(error.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsSubmitLoading(false);
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

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading || isSubmitLoading}
        className="
          flex items-center justify-center w-full px-4 py-2.5 
          rounded-xl border border-soft text-sm font-medium
          transition-all duration-200 hover-lift active:scale-[0.98]
          bg-white text-slate-700 hover:bg-slate-50
          dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-800/60
          disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
        "
      >
        {isGoogleLoading ? <LoadingSpinner /> : <GoogleIcon />}
        {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
      </button>

      <div className="flex items-center my-0.5">
        <div className="flex-1 border-t border-soft"></div>
        <span className="px-3 text-xs uppercase tracking-wider text-muted font-semibold bg-transparent">
          OR
        </span>
        <div className="flex-1 border-t border-soft"></div>
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
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
      </div>
      {error && (
        <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-sm text-sm text-red-600 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={isGoogleLoading || isSubmitLoading}
        className="btn btn-primary cursor-pointer w-full mt-2 hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitLoading ? "Logging in..." : "Login"}
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
