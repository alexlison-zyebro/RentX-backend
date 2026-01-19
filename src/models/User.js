import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  role: {
    type: [String],
    enum: ["BUYER", "SELLER","ADMIN"],
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  phone: String,
  password: String,

  isEmailVerified: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: ["ACTIVE","INACTIVE", "PENDING", "APPROVED"],
  },

  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },

  buyerDetails: {
    buyerName: String,
    dob: String
  },

  sellerDetails: {
    sellerType: {
      type: String,
      enum: ["INDIVIDUAL", "ORGANIZATION"]
    },
    individualName: String,
    individualDob: String,
    organizationName: String,
    organizationRegDate:String,
    aadhaarNumber: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Users", userSchema);
