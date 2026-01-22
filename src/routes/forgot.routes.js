import express from "express";
import {
  sendForgotOtpController,
  verifyForgotOtpController,
  resetPasswordController
} from "../controllers/forgot.controllers.js";

const router = express.Router();

router.post("/send-otp", sendForgotOtpController);
router.post("/verify-otp", verifyForgotOtpController);
router.post("/reset-password", resetPasswordController);

export default router;
