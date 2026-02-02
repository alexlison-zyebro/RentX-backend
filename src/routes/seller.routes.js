import express from "express";
import { activateSubscription, checkSubscriptionStatus } from "../controllers/subscription.controllers.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

// Subscription routes 
router.post("/subscription/activate", activateSubscription);
router.post("/subscription/status", checkSubscriptionStatus);


export default router;