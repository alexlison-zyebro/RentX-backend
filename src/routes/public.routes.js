import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { viewAllCategories } from '../controllers/category.controllers.js';

const router = express.Router();

router.use(authenticate);
router.post('/categories/all', viewAllCategories);

export default router;
