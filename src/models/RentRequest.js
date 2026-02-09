import mongoose from "mongoose";

const rentRequestSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: Date,
    required: true
  },
  
  totalDays: {
    type: Number,
    required: true
  },
  
  pricePerDay: {
    type: Number,
    required: true
  },
  
  totalAmount: {
    type: Number,
    required: true
  },
  
  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED", "COLLECTED", "COMPLETED"],
    default: "PENDING"
  },
  
  rejectionReason: {
    type: String,
    default: null
  },
  
  acceptedAt: {
    type: Date,
    default: null
  },
  
  collectedAt: {
    type: Date,
    default: null
  },
  
  completedAt: {
    type: Date,
    default: null
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("RentRequest", rentRequestSchema);