import { useContext, useRef, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext.jsx";
import { auth, googleProvider } from "../utils/firebase";
import { signInWithPopup } from "firebase/auth";

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2.5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

const LoadingSpinner = () => (
  <svg className="animate-spin -ml-1 mr-2.5 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const Login = () => {
  const cardRef = useRef(null);

  // two states for inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [tempUserId, setTempUserId] = useState(null);

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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      localStorage.removeItem("token");
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await api.post("/auth/google-login", { idToken });
      setUser(res.data.user);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to log in with Google.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    // prevents page from refreshing
    e.preventDefault();
    setIsSubmitLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.requires2FA) {
        setTempUserId(res.data.tempUserId);
        return;
      }
      const me = await api.get("/auth/me");
      setUser(me.data.user);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/login-2fa", { tempUserId, token: totpCode });
      const me = await api.get("/auth/me");
      setUser(me.data.user);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || "Invalid 2FA code.");
    }
  };

  if (tempUserId) {
    return (
      <div className="auth-page-bg min-h-[calc(100vh-3.75rem)] w-full flex items-center justify-center px-6 pt-10 pb-24 md:pb-32 overflow-hidden relative">
        <div className="absolute top-[-120px] left-[-80px] w-[340px] h-[570px] rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute bottom-[-140px] right-[-80px] w-[550px] h-[350px] rounded-full bg-sky-500/20 blur-3xl"></div>
        <form
          onSubmit={handle2FASubmit}
          className="surface-bg animate-in w-full max-w-md rounded-[30px] px-8 py-10 flex flex-col gap-6 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
        >
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-main">Two-Factor Auth</h1>
            <p className="text-sm text-muted">Enter the code from your authenticator app</p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="totp" className="text-sm font-medium text-main">TOTP Code</label>
            <input
              type="text"
              id="totp"
              placeholder="123456"
              required
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              className="input-modern w-full px-4 py-3 rounded-2xl text-sm"
            />
          </div>
          {error && (
            <div className="px-4 py-3 rounded-2xl text-sm border bg-red-500/10 border-red-500/20 text-red-500">
              {error}
            </div>
          )}
          <button type="submit" className="btn btn-primary w-full py-3 rounded-2xl cursor-pointer">
            Verify
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-page-bg min-h-[calc(100vh-3.75rem)] w-full flex items-center justify-center px-6 pt-10 pb-24 md:pb-32 overflow-hidden relative">
      <div className="absolute top-[-120px] left-[-80px] w-[340px] h-[570px] rounded-full bg-indigo-500/20 blur-3xl"></div>
      <div className="absolute bottom-[-140px] right-[-80px] w-[550px] h-[350px] rounded-full bg-sky-500/20 blur-3xl"></div>
      <div className="absolute top-[-140px] right-[-80px] w-[550px] h-[350px] rounded-full bg-violet-500/20 blur-3xl"></div>
      <div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="relative z-10 w-full max-w-md will-change-transform transform-gpu">
        <form onSubmit={handleSubmit} className="surface-bg animate-in w-full rounded-[30px] px-8 py-10 flex flex-col gap-6 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-main">Welcome Back</h1>
            <p className="text-sm text-muted">Login to continue your experience</p>
          </div>
          <button type="button" onClick={handleGoogleLogin} disabled={isGoogleLoading || isSubmitLoading} className="
flex items-center justify-center
w-full px-4 py-3
rounded-2xl
!bg-white
!text-black
!border
!border-gray-300
font-medium
shadow-sm
transition-all duration-200
hover:bg-gray-50
hover:border-gray-400
hover:-translate-y-[1px]
hover:shadow-md
dark:bg-slate-900/50
dark:border-slate-700
dark:text-slate-100
disabled:opacity-50
cursor-pointer
">

            {isGoogleLoading ? <LoadingSpinner /> : <GoogleIcon />}
            {isGoogleLoading ? "Connecting..." : "Continue with Google"}
          </button>
          <div className="flex items-center">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="px-4 text-xs font-semibold tracking-[0.2em] uppercase text-muted">OR</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-main">Email</label>
            <input type="email" id="email" placeholder="user@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-modern w-full px-4 py-3 rounded-2xl text-sm" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-main">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} id="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-modern w-full px-4 py-3 pr-11 rounded-2xl text-sm" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors cursor-pointer">
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="px-4 py-3 rounded-2xl text-sm border bg-red-500/10 border-red-500/20 text-red-500">
              {error}
            </div>
          )}
          <button type="submit" disabled={isGoogleLoading || isSubmitLoading} className="btn btn-primary w-full py-3 rounded-2xl cursor-pointer disabled:opacity-50">
            {isSubmitLoading ? "Logging in..." : "Login"}
          </button>
          <p className="text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-main font-semibold hover:underline">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;