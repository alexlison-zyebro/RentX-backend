import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { approveSeller, getAllSellers, getPendingSellers, getSellerDetails, rejectSeller } from "../controllers/admin.controllers.js";
import { addCategory, updateCategory, deleteCategory, toggleCategoryStatus } from '../controllers/category.controllers.js'
import { toggleBuyerStatus, viewAllBuyers } from "../controllers/buyer.controllers.js";
import { viewAllSellers } from "../controllers/seller.controllers.js";

const router = express.Router();

router.use(authenticate);
router.use(isAdmin);

//seller 
router.post("/sellers/pending",getPendingSellers);
router.post("/sellers/all",getAllSellers);
router.post("/sellers/details",getSellerDetails);
router.post("/sellers/approve",approveSeller);
router.post("/sellers/reject",rejectSeller);

// Seller Management
router.get('/sellers/ListAll',viewAllSellers);
router.put('/sellers/toggle-status/:id',toggleBuyerStatus);


//buyer
router.get('/buyers/all',viewAllBuyers);
router.put('/buyers/toggle-status/:id',toggleBuyerStatus);

// Category
router.post('/categories/add', addCategory);
router.put('/categories/update/:id', updateCategory); 
router.post('/categories/delete/:id', deleteCategory);  
router.post('/categories/toggle-status/:id', toggleCategoryStatus);



export default router;
