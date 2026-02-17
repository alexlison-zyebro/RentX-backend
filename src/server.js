import "dotenv/config"; 
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import forgotRoutes from "./routes/forgot.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import sellerRoutes from "./routes/seller.routes.js"; 
import publicRoutes from "./routes/public.routes.js";


const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// multer setup
app.use("/uploads", express.static("uploads"));


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/forgot", forgotRoutes);  

// Admin Routes
app.use("/api/admin",adminRoutes);

//Seller Routes

app.use("/api/seller",sellerRoutes);

app.use("/api",publicRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});