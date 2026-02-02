import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  role: {
    type: [String],
    enum: ["BUYER", "SELLER", "ADMIN"],
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

  isSubscribed: {
    type: String,
    enum: ["NONE", "ACTIVE", "EXPIRED"],
    default: "NONE",
  },

  subscriptionStartDate: {
    type: Date
  },

  subscriptionEndDate: {
    type: Date
  },

  subscriptionPrice: {
    type: Number,
  },

  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE", "PENDING", "APPROVED","REJECTED"],
    default: "ACTIVE"
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

    organizationName: {
      type: String,
      required: function () {
        return this.sellerDetails?.sellerType === "ORGANIZATION";
      }
    },

    aadhaarNumber: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", userSchema);
