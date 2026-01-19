import express from "express";
import {
  sendOtp,
  verifyOtpController,
  registerUser
} from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtpController);
router.post("/register", registerUser);

export default router;
