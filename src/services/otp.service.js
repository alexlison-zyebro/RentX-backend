import Otp from "../models/Otp.js";

// Generate new OTP & save
export const generateAndSaveOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Remove old OTPs for this email
  await Otp.deleteMany({ email });

  await Otp.create({
    email,
    otp,
    purpose: "REGISTER",
    expiresAt: Date.now() + 5 * 60 * 1000 
  });

  return otp;
};


// Verify OTP
export const verifyOtp = async (email, userOtp, purpose) => {
  const record = await Otp.findOne({
    email,
    otp: userOtp,
    purpose
  });

  if (!record) return false;
  if (record.expiresAt < Date.now()) return false;

  record.isVerified = true;
  await record.save();

  return true;
};

