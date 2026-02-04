import express from "express";
import { activateSubscription, checkSubscriptionStatus } from "../controllers/subscription.controllers.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  toggleProductAvailability
} from "../controllers/product.controllers.js";
import upload from "../config/multer.config.js";

const router = express.Router();

router.use(authenticate);

// Subscription routes 
router.post("/subscription/activate", activateSubscription);
router.post("/subscription/status", checkSubscriptionStatus);

// Product routes
router.post(
  "/add-product",
  upload.single("image"),
  addProduct
);
router.post("/allProducts", getAllProducts); 
router.post("/products/:id", getProductById); 
router.put(
  "/updateProduct/:id",
  upload.single("image"),
  updateProduct
);
router.put("/toggle-availability/:id", toggleProductAvailability);

export default router;