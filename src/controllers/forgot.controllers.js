import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { sendMail } from "../utils/mailer.js";
import { verifyOtp } from "../services/otp.service.js";
import bcrypt from "bcrypt";


export const sendForgotOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "FAILED",
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "FAILED",
        message: "User not found"
      });
    }

    await Otp.deleteMany({
      email,
      purpose: "FORGOT_PASSWORD"
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
      email,
      otp,
      purpose: "FORGOT_PASSWORD",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    const emailSubject = "RentX Password Reset OTP";
    const emailBody = `
      <h3>Password Reset Request</h3>
      <p>Your OTP for resetting your password is:</p>
      <h2 style="letter-spacing:3px;">${otp}</h2>
      <p>This OTP is valid for <b>5 minutes</b>.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendMail(email, emailSubject, emailBody);

    res.status(200).json({
      status: "SUCCESS",
      message: "OTP sent to email"
    });

  } catch (error) {
    console.error("Forgot OTP Error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Failed to send OTP"
    });
  }
};

/* VERIFY OTP - FORGOT PASSWORD */
export const verifyForgotOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const isValid = await verifyOtp(email, otp, "FORGOT_PASSWORD");

    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({
      status: "SUCCESS",
      message: "OTP verified successfully"
    });

  } catch (error) {
    console.log("error ->",error)
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/* RESET PASSWORD */
export const resetPasswordController = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const otpValid = await verifyOtp(email, otp, "FORGOT_PASSWORD");
    if (!otpValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { email },
      { password: hashedPassword }
    );

    // cleanup
    await Otp.deleteMany({ email, purpose: "FORGOT_PASSWORD" });

    res.json({
      status: "SUCCESS",
      message: "Password updated successfully"
    });

  } catch (error) {
    console.log("Error-->",error)
    res.status(500).json({ message: "Password reset failed" });
  }
};
