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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [tempUserId, setTempUserId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || "/dashboard";

  const { setUser } = useContext(AuthContext);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    card.style.transition = "transform 0.1s ease-out";
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
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
      const res = await api.post("/auth/google", { idToken });
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
      await api.post("/auth/login/2fa", { tempUserId, token: totpCode });
      const me = await api.get("/auth/me");
      setUser(me.data.user);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || "Invalid 2FA code.");
    }
  };

  // Navbar components mirrored from screenshot
  const Navbar = () => (
    <div className="absolute top-0 left-0 w-full flex items-center justify-between px-12 py-6 z-50">
      <div className="flex items-center gap-2">
        <div className="bg-[#4fbcae] text-white font-black rounded-lg w-8 h-8 flex items-center justify-center text-lg shadow-sm">D</div>
        <span className="text-xl font-bold text-[#2a7e74] tracking-tight">DailyForge</span>
      </div>
      <div className="flex items-center gap-6">
        <button className="p-2.5 rounded-xl border border-[#4fbcae]/20 text-[#2a7e74] bg-white/40 hover:bg-white/60 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M6.343 6.343l.707-.707M14.5 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </button>
        <Link to="/login" className="text-[#2a7e74] font-semibold hover:text-[#1e5c54] transition-colors">Login</Link>
        <Link to="/signup" className="bg-[#4fbcae] text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-[#3ea89a] transition-all transform hover:-translate-y-[1px]">Signup</Link>
      </div>
    </div>
  );

  if (tempUserId) {
    return (
      <div className="bg-gradient-to-tr from-[#d2f3ee] via-[#e6f9f6] to-[#dff0ff] min-h-screen w-full flex items-center justify-center px-6 py-10 overflow-hidden relative font-sans">
        <Navbar />
        <form
          onSubmit={handle2FASubmit}
          className="bg-white/95 backdrop-blur-md w-full max-w-md rounded-[32px] px-10 py-12 flex flex-col gap-6 border border-white/40 shadow-[0_25px_50px_-12px_rgba(42,126,116,0.15)] z-10"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#2a7e74]">Two-Factor Auth</h1>
            <p className="text-sm text-slate-500 font-medium">Enter the code from your authenticator app</p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="totp" className="text-sm font-semibold text-[#2a7e74]">TOTP Code</label>
            <input
              type="text"
              id="totp"
              placeholder="123456"
              required
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl text-sm border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4fbcae]/30 focus:border-[#4fbcae] transition-all text-slate-800"
            />
          </div>
          {error && (
            <div className="px-4 py-3 rounded-2xl text-sm border bg-red-500/10 border-red-500/20 text-red-600 font-medium">
              {error}
            </div>
          )}
          <button type="submit" className="w-full py-3.5 rounded-2xl bg-[#4fbcae] hover:bg-[#3ea89a] text-white font-bold shadow-lg shadow-[#4fbcae]/20 transition-all active:scale-[0.99] cursor-pointer">
            Verify
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-tr from-[#c4f1ea] via-[#e3f7f4] to-[#dbeeff] min-h-screen w-full flex items-center justify-center px-6 py-10 overflow-hidden relative font-sans">
      <Navbar />
      
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-teal-300/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-sky-300/20 blur-3xl pointer-events-none"></div>

      <div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="relative z-10 w-full max-w-[440px] will-change-transform transform-gpu">
        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-md w-full rounded-[32px] px-10 py-12 flex flex-col gap-6 border border-white/60 shadow-[0_30px_70px_-15px_rgba(42,126,116,0.18)]">
          
          <div className="text-center space-y-1.5">
            <h1 className="text-[32px] font-extrabold tracking-tight text-[#2a7e74]">Welcome Back</h1>
            <p className="text-sm font-medium text-teal-600/80">Login to continue your experience</p>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin} 
            disabled={isGoogleLoading || isSubmitLoading} 
            className="flex items-center justify-center w-full px-4 py-3.5 rounded-2xl border border-slate-200/80 bg-slate-100/70 hover:bg-slate-200/60 text-slate-600 font-semibold transition-all duration-200 transform active:scale-[0.99] disabled:opacity-50 cursor-pointer text-sm"
          >
            {isGoogleLoading ? <LoadingSpinner /> : <GoogleIcon />}
            {isGoogleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          <div className="flex items-center my-1">
            <div className="flex-1 h-px bg-slate-200/80"></div>
            <span className="px-4 text-[11px] font-bold tracking-[0.25em] uppercase text-teal-700/50">OR</span>
            <div className="flex-1 h-px bg-slate-200/80"></div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[13px] font-bold text-[#2a7e74] tracking-wide">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="user@email.com" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-4 py-3.5 rounded-2xl text-sm border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4fbcae]/20 focus:border-[#4fbcae] transition-all text-slate-800 placeholder-slate-400" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[13px] font-bold text-[#2a7e74] tracking-wide">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                placeholder="••••••••" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-3.5 pr-12 rounded-2xl text-sm border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4fbcae]/20 focus:border-[#4fbcae] transition-all text-slate-800 placeholder-slate-400" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2a7e74] transition-colors cursor-pointer"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-2xl text-sm border bg-red-500/10 border-red-500/20 text-red-600 font-medium">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isGoogleLoading || isSubmitLoading} 
            className="w-full py-3.5 rounded-2xl bg-[#4fbcae] hover:bg-[#3ea89a] text-white font-bold shadow-lg shadow-[#4fbcae]/25 transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-2 text-sm tracking-wide"
          >
            {isSubmitLoading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-slate-500 font-medium mt-1">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-[#4fbcae] font-bold hover:text-[#2a7e74] hover:underline transition-all">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
