import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  description: {
    type: String,
    required: true,
    trim: true
  },

  image: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
  },

  remaining_quantity: {
    type: Number,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true
  },

  pricePerDay: {
    type: Number,
    required: true
  },

  description: {
    type: String,
    of: String,
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

});


export default mongoose.model("Product", productSchema);