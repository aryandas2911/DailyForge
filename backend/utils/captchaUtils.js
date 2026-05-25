import axios from "axios";

export async function verifyCaptcha(token) {
  const secret = process.env.TURNSTILE_CLOUDFARE_SECRET_KEY;

  if (!secret) {
    console.warn("TURNSTILE_CLOUDFARE_SECRET_KEY is not set. Skipping captcha verification.");
    return true; // Don't block if not configured in dev
  }

  if (!token) {
    throw new Error("Captcha token is required");
  }

  try {
    const response = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        secret: secret,
        response: token,
      }
    );

    if (response.data.success !== true) {
      throw new Error("Captcha verification failed");
    }

    return true;
  } catch (error) {
    console.error("Captcha verification failed:", error.message);
    throw new Error("Captcha verification failed");
  }
}
