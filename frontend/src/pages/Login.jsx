import { useContext, useState, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import gsap from "gsap";
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
  const buttonRef = useRef(null);
  const cardRef = useRef(null);

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
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      console.log("Login success: ", res.data);

      // Animate the button to fill the screen
      if (buttonRef.current) {
        const btn = buttonRef.current;
        const rect = btn.getBoundingClientRect();
        
        // Calculate center of the button
        const size = 10;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = `${centerY - size / 2}px`;
        overlay.style.left = `${centerX - size / 2}px`;
        overlay.style.width = `${size}px`;
        overlay.style.height = `${size}px`;
        overlay.style.backgroundColor = window.getComputedStyle(btn).backgroundColor;
        overlay.style.borderRadius = "50%";
        overlay.style.zIndex = "9999";
        overlay.style.transformOrigin = "center center";
        
        const textEl = document.createElement("div");
        textEl.innerText = "Logging in..";
        textEl.style.position = "fixed";
        textEl.style.top = "50%";
        textEl.style.left = "50%";
        textEl.style.transform = "translate(-50%, -50%)";
        textEl.style.color = window.getComputedStyle(btn).color;
        textEl.style.fontSize = "1.5rem";
        textEl.style.fontWeight = "bold";
        textEl.style.zIndex = "10000";
        textEl.style.opacity = "0";
        textEl.style.fontFamily = window.getComputedStyle(btn).fontFamily;

        document.body.appendChild(overlay);
        document.body.appendChild(textEl);
        // Don't hide the button, let the bubble swallow it
        // Calculate max scale to cover the screen
        const maxDistX = Math.max(centerX, window.innerWidth - centerX);
        const maxDistY = Math.max(centerY, window.innerHeight - centerY);
        const maxRadius = Math.sqrt(maxDistX * maxDistX + maxDistY * maxDistY);
        const scale = (maxRadius * 2) / size;

        const tl = gsap.timeline({
          onComplete: () => {
            overlay.remove();
            textEl.remove();
            if (res.data.user) {
              setUser(res.data.user);
            }
            navigate(redirectPath, { replace: true });
          }
        });

        tl.to(overlay, {
          scale: scale,
          duration: 0.8,
          ease: "power2.inOut",
        })
        .to(textEl, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out"
        })
        .to(textEl, {
          opacity: 1,
          duration: 1.5
        });
      } else {
        if (res.data.user) {
          setUser(res.data.user);
        }
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      // handle error
      console.log("Login failed");
      console.log(error.response?.data || error.message);
      setError(error.response?.data?.message || "Invalid email or password.");
      setIsSubmitLoading(false);
    }
  };

  // login component
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
          className="
            surface-bg px-8 py-10 rounded-[30px]
            w-full
            flex flex-col gap-6 animate-in
            border border-white/10
            shadow-[0_20px_60px_rgba(0,0,0,0.7)]
          "
          onSubmit={handleSubmit}
        >
          <div className="text-center space-y-1 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-main">Welcome Back</h1>
            <p className="text-sm text-muted">Login to continue your experience</p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isSubmitLoading}
            className="
              flex items-center justify-center w-full px-4 py-3
              rounded-2xl border border-soft text-sm font-medium
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@email.com"
              required
              className="
                w-full px-4 py-3
                text-sm
                surface-bg
                border-soft
                rounded-2xl
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="
                  w-full px-4 py-3 pr-11
                  text-sm
                  surface-bg
                  border-soft
                  rounded-2xl
                  shadow-xs
                  input-focus
                  hover-lift
                "
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors cursor-pointer flex items-center justify-center"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-500">
              {error}
            </div>
          )}
          
          <button
            ref={buttonRef}
            type="submit"
            disabled={isGoogleLoading || isSubmitLoading}
            className="btn btn-primary cursor-pointer w-full py-3 mt-1 hover-lift disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl"
          >
            {isSubmitLoading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-muted">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-main font-semibold cursor-pointer hover:underline transition-colors"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;