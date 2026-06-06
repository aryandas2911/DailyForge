import {  useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { Eye, EyeOff } from "lucide-react";

import api from "../api/axios";



// Google Icon
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2.5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
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

const Forgot = () => {
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

  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");

  const [isVerifiedOtp, setIsVerifiedOtp] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [password, setPassword] = useState("");

  const [sentEmail, setSentEmail] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");

  const [timer, setTimer] = useState(60);

  const [error, setError] = useState("");

  const [otpError, SetOtpError] = useState("");

  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();




  // Email Login
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitLoading(true);

    if (email.trim() === "") {
      setError("Email cannot Be Empty");
      return;
    }

    setError("");

    try {
      const response = await api.post("/api/auth/forgot", {
        email,
      });

      if (response.status == 200) {
        setSentEmail(true);
        setTimer(60);
      }
    } catch (error) {
      console.log(error, "error aya hai");

      setError(error.response?.data?.message || "Invalid email");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  async function handleResendOtp() {
    setTimer(60);

    try {
      const response = await api.post("/api/auth/forgot", {
        email,
      });
    } catch (err) {
      SetOtpError(err.response.data.message);
    }
  }

  const submitOtp = async (e) => {
    e.preventDefault();
     SetOtpError("");
     

    if (otp.length !== 6) {
      SetOtpError("OTP should be 6 digits");
      return;
    }

    try {
      const response = await api.post("api/auth/verify-otp", {
        otp,
        email,
      });

      if (response.data.success) {
        setIsVerifiedOtp(true);
      }
    } catch (err) {
      SetOtpError(err.response?.data?.message);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();

    setPasswordError("");

    if (!password.trim() || !confirmPassword.trim()) {
      setPasswordError("All fields are required");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Password and Confirm Password should be same");
      return;
    }

    try {
      const response = await api.put("api/auth/change-password", {
        password,
        email,
      });

      if (response.data.success) {
        navigate("/");
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

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
        <div
          className="
          surface-bg
          animate-in
          w-full
          rounded-[30px]
          px-8
          py-10
          flex
          flex-col
          gap-6
          border
          border-white/10
          shadow-[0_20px_60px_rgba(0,0,0,0.7)]
        "
        >
          {!isVerifiedOtp ? (
            <>
              <form onSubmit={handleSubmit}>
                {/* Heading */}
                <div className="text-center space-y-2">
                  <h1 className="text-4xl my-1 font-bold tracking-tight text-main">
                    Forgot Password
                  </h1>
                </div>

                {/* Divider */}
                <div className="flex items-center"></div>

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

                {/* Error */}
                {error && (
                  <div
                    className="
              px-4 py-3 mt-3
              rounded-2xl
              text-sm
              border
              bg-red-500/10
              border-red-500/20
              text-red-500
            "
                  >
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={sentEmail}
                  className="
            btn btn-primary mt-5
            w-full
            py-3
            rounded-2xl
            cursor-pointer
            disabled:opacity-50
          "
                >
                  Send Otp
                </button>

                {/* Footer */}
                <p className="text-center mt-5 text-sm text-muted">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="
              text-main
              font-semibold
              hover:text-cyan-700
            "
                  >
                    Login
                  </Link>
                </p>
              </form>

              {sentEmail && (
                <>
                  {" "}
                  <div className="flex flex-col gap-2">
                    {" "}
                    <label
                      htmlFor="otp"
                      className="text-sm font-medium text-main"
                    >
                      {" "}
                      Enter OTP{" "}
                    </label>{" "}
                    <input
                      type="number"
                      id="otp"
                      placeholder="Enter 6-digit OTP"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className=" input-modern w-full px-4 py-3 rounded-2xl text-sm tracking-[0.35em] text-center "
                    />{" "}
                    <span className="text-xs my-2 ml-2">
                      {" "}
                      Resend Otp in{" "}
                      <span className="text-red-400"> {timer} </span>'s seconds
                    </span>
                    {otpError && (
                      <div
                        className="
              px-4 py-3 my-2
              rounded-2xl
              text-sm
              border
              bg-red-500/10
              border-red-500/20
              text-red-500
            "
                      >
                        {otpError}
                      </div>
                    )}
                    <button
                      onClick={submitOtp}
                      type="submit"
                      className="
            btn btn-primary
            w-full
            py-3
            rounded-2xl
            cursor-pointer
            disabled:opacity-50
          "
                    >
                      Submit Otp
                    </button>
                  </div>{" "}
                  {/* Resend OTP */}{" "}
                  <div className="flex items-center justify-between text-sm">
                    {" "}
                    <span className="text-muted">
                      {" "}
                      Didn’t receive the OTP?{" "}
                    </span>{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={timer > 0}
                      className=" text-main disabled:opacity-50 disabled:hover:text-neutral-50 font-semibold  hover:text-cyan-800 cursor-pointer "
                    >
                      {" "}
                      Resend{" "}
                    </button>{" "}
                  </div>{" "}
                </>
              )}
            </>
          ) : (
            <div>
              <form onSubmit={submitPassword}>
                {/* Heading */}
                <div className="text-center space-y-2">
                  <h1 className="text-4xl my-1 font-bold tracking-tight text-main">
                    Change Password
                  </h1>
                </div>

                {/* Divider */}
                <div className="flex items-center"></div>

                {/* Email */}
                <div className="flex flex-col my-4 gap-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-main"
                  >
                    Password
                  </label>

                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="●●●●●●●●"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="
              input-modern
              w-full
              px-4
              py-3
              rounded-2xl
              text-sm
                 "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                                  absolute
                                  right-10
                                  top-2/5
                                  -translate-y-1/2
                                  text-muted
                                  hover:text-main
                                  transition-colors
                                  cursor-pointer
                                "
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>

                <div className="flex flex-col my-4 gap-2">
                  <label
                    htmlFor="confirmpassword"
                    className="text-sm font-medium text-main"
                  >
                    Confirm Password
                  </label>

                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmpassword"
                    placeholder="●●●●●●●●"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="
              input-modern
              w-full
              px-4
              py-3
              rounded-2xl
              text-sm
            "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                absolute
                right-10
                top-2/3
                -translate-y-1/1
                text-muted
                hover:text-main
                transition-colors
                cursor-pointer
              "
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>

                  {passwordError && (
                    <div
                      className="
              px-4 py-3 mt-3
              rounded-2xl
              text-sm
              border
              bg-red-500/10
              border-red-500/20
              text-red-500
            "
                    >
                      {passwordError}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  // disabled={""}
                  className="
            btn btn-primary mt-5
            w-full
            py-3
            rounded-2xl
            cursor-pointer
            disabled:opacity-50
          "
                >
                  Change Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forgot;
