import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { approveSeller, getAllSellers, getPendingSellers, getSellerDetails, rejectSeller } from "../controllers/admin.controllers.js";



const router = express.Router();

router.use(authenticate);
router.use(isAdmin);

router.post("/sellers/pending",getPendingSellers);
router.post("/sellers/all",getAllSellers);
router.post("/sellers/details",getSellerDetails);
router.post("/sellers/approve",approveSeller);
router.post("/sellers/reject",rejectSeller);

export default router;
