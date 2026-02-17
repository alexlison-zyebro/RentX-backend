import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },

  otp: {
    type: String,
    required: true
  },
  isVerified: {
  type: Boolean,
  default: false
},
  purpose: {
    type: String,
    enum: ["REGISTER", "FORGOT_PASSWORD"],
    required: true
  },
  
  expiresAt: {
    type: Date,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Otps", otpSchema);
