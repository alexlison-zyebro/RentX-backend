import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { viewAllCategories } from '../controllers/category.controllers.js';
import { createRentRequest, getBuyerRentRequests, getRentRequestById } from "../controllers/rentRequest.controllers.js";
import { updateBuyer, viewBuyerById } from "../controllers/buyer.controllers.js";
import { getAllProducts } from "../controllers/product.controllers.js";

const router = express.Router();

router.use(authenticate);
router.post("/allProducts", getAllProducts); 
router.post('/categories/all', viewAllCategories);
router.post("/createRequest", createRentRequest);
router.post("/my-requests", getBuyerRentRequests);
router.post("/requestById", getRentRequestById);

router.get("/buyer/:id", viewBuyerById);
router.put("/buyerUpdate/:id", authenticate, updateBuyer);

export default router;
