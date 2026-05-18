import nodemailer from 'nodemailer'
import dotenv from "dotenv";
dotenv.config()


const otpStore = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_WRONG_ATTEMPTS = 5;


//here for password you need to generate password for sending in gmail send password after two step verification is on
//ask chatgpt for what to do if confused and further step
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
})

//to generate 4 digit otp
function generateOtp() {
    return String(Math.floor(1000 + Math.random() * 9000))
}

const emailFormat = (otp) => {
    return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;
                border:1px solid #e0e0e0;border-radius:8px;padding:32px;">
      <h2 style="color:#4F46E5;margin-top:0;">Verify your email</h2>
      <p style="color:#374151;font-size:15px;">
        Use the code below to complete your sign-up. It expires in
        <strong>10 minutes</strong>.
      </p>
      <div style="background:#F3F4F6;border-radius:6px;padding:20px;
                  text-align:center;letter-spacing:12px;
                  font-size:36px;font-weight:bold;color:#111827;">
        ${otp}
      </div>
      <p style="color:#6B7280;font-size:13px;margin-top:24px;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  `
}

export const sendOTP = async(email) => {
    const otp = generateOtp();

    const normalizedEmail = email.toLowerCase().trim();

    otpStore.set(normalizedEmail, {
        otp,
        expiresAt: Date.now() + OTP_EXPIRY_MS,
        attempts: 0,
    })

    await transporter.sendMail({
        from: `"No Reply" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your verification code",
        html: emailFormat(otp)
    });
    return otp;
}

export const verifyOtp = (email, enteredOtp) => {
    const key = email.toLowerCase()
    const record = otpStore.get(key)

    if (!record) {
        return { success: false, message: "No OTP found for this email. Please request a new one." };
    }

    if (Date.now() > record.expiresAt) {
        otpStore.delete(key);
        return { success: false, message: "OTP has expired. Please request a new one." };
    }

    if (record.attempts >= MAX_WRONG_ATTEMPTS) {
        otpStore.delete(key);
        return { success: false, message: "Too many failed attempts. Please request a new OTP." };
    }

    // Wrong OTP
    if (record.otp !== String(enteredOTP).trim()) {
        record.attempts += 1;
        const remaining = MAX_WRONG_ATTEMPTS - record.attempts;
        return {
            success: false,
            message: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
        };
    }

    otpStore.delete(key);
    return { success: true, message: "Email verified successfully." };
}

export function clearOTP(email) {
    otpStore.delete(email.toLowerCase());
}