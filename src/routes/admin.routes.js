import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { approveSeller, getAllSellers, getPendingSellers, getSellerDetails, rejectSeller } from "../controllers/admin.controllers.js";
import { addCategory, viewAllCategories, updateCategory, deleteCategory, toggleCategoryStatus } from '../controllers/category.controllers.js'

const router = express.Router();

router.use(authenticate);
router.use(isAdmin);

//seller 
router.post("/sellers/pending",getPendingSellers);
router.post("/sellers/all",getAllSellers);
router.post("/sellers/details",getSellerDetails);
router.post("/sellers/approve",approveSeller);
router.post("/sellers/reject",rejectSeller);

// Category
router.post('/categories/add', addCategory);
router.post('/categories/all', viewAllCategories);  
router.post('/categories/update/:id', updateCategory); 
router.post('/categories/delete/:id', deleteCategory);  
router.post('/categories/toggle-status/:id', toggleCategoryStatus);


export default router;
