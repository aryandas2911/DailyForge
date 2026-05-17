import React, { useContext, useRef, useState } from 'react'
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const VerifyOtp = () => {


    const [otp, setOtp] = useState(["", "", "", ""]);
    const { setUser, setToken } = useContext(AuthContext);
    const inputRefs = useRef([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (value, index) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Move to next input
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Move back on backspace
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        // prevents page from refreshing
        e.preventDefault();
        const finalOtp = otp.join("");
        console.log(finalOtp);
        setIsLoading(true)

        // send request to server to verify otp
        try {
            
            const verificationToken = localStorage.getItem('verificationToken')
            const res = await api.post("/api/auth/verifyotp", {
                otp: finalOtp,
                verificationToken,
            });

            console.log("Signup success: ", res.data);

            // save token in localstorage for later api calls
            localStorage.setItem("token", res.data.token);
            setToken(res.data.token);

            // get user details
            const me = await api.get("/api/auth/me");
            setUser(me.data.user);

            // redirect to dashboard
            navigate("/dashboard");
        } catch (error) {
            // handle error
            console.log("Signup failed");
            const errorMessage = error.response?.data?.message || error.message || "Signup failed. Please try again.";
            console.log(errorMessage);
        } finally {
            // reset loading state
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        const verificationToken = localStorage.getItem('verificationToken')
        console.log(verificationToken);
        const res = await api.post("/api/auth/resend", { verificationToken });

        alert(res.data.message)
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="
          surface-bg px-10 py-15 rounded-2xl
          w-full max-w-sm
          flex flex-col gap-6
          animate-in
        "
            >
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-main">
                        Verify OTP
                    </h1>

                    <p className="text-sm text-muted">
                        Enter the 4 digit code sent to your email
                    </p>
                </div>

                <div className="flex items-center justify-center gap-3">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                                handleChange(e.target.value, index)
                            }
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="
                w-14 h-14
                text-center text-xl font-semibold
                surface-bg
                border-soft
                rounded-base
                shadow-xs
                input-focus hover-lift
              "
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    className="
            btn btn-primary
            cursor-pointer
            w-full
            hover-lift
          "
                >
                    Verify OTP
                </button>

                <p className="text-center text-sm text-muted">
                    Didn't receive the code?{" "}
                    <button
                        type="button"
                        className="
              text-main font-medium
              hover:underline
              transition-colors
              cursor-pointer
            "
                        onClick={handleResend}
                    >
                        Resend
                    </button>
                </p>
            </form>
        </div>
    )
}

export default VerifyOtp