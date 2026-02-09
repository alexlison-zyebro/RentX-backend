import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { viewAllCategories } from '../controllers/category.controllers.js';
import { createRentRequest, getBuyerRentRequests, getRentRequestById } from "../controllers/rentRequest.controllers.js";

const router = express.Router();

router.use(authenticate);
router.post('/categories/all', viewAllCategories);
router.post("/createRequest", createRentRequest);
router.post("/my-requests", getBuyerRentRequests);
router.post("/requestById", getRentRequestById);

export default router;
