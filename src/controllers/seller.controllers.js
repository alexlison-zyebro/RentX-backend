import {
  viewAllSellersService,
  viewSellerByIdService,
  updateSellerService,
  toggleSellerStatusService
} from "../services/seller.service.js";

// View all sellers (Admin only)
export const viewAllSellers = async (req, res) => {
  try {
    const result = await viewAllSellersService();
    return res.status(200).json(result);
  } catch (error) {
    console.error("View all sellers controller error:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};

// View seller by ID 
export const viewSellerById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await viewSellerByIdService(id);
    
    return res.status(result.status === "SUCCESS" ? 200 : 404).json(result);
  } catch (error) {
    console.error("View seller by ID controller error:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};

// Update seller 
export const updateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const result = await updateSellerService(id, updateData);
    
    return res.status(result.status === "SUCCESS" ? 200 : 400).json(result);
  } catch (error) {
    console.error("Update seller controller error:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};

// Toggle seller status ACTIVE/INACTIVE (Admin only)
export const toggleSellerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await toggleSellerStatusService(id);
    
    return res.status(result.status === "SUCCESS" ? 200 : 400).json(result);
  } catch (error) {
    console.error("Toggle seller status controller error:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};