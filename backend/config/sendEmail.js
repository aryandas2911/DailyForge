import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail = async (email, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: `"DailyForge" <${process.env.EMAIL}>`,
      to: email,
      subject: "DailyForge",
      html: htmlContent,
    });
    console.log("Email sent:");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};
