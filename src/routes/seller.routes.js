import express from "express";
import { activateSubscription } from "../controllers/subscription.controllers.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

// Subscription routes 
router.post("/subscription/activate", activateSubscription);

export default router;