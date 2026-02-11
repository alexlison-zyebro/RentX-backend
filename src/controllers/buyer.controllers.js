import {
  viewAllBuyersService,
  viewBuyerByIdService,
  updateBuyerService,
  toggleBuyerStatusService
} from "../services/buyer.service.js";

// View all buyers (Admin only)
export const viewAllBuyers = async (req, res) => {
  try {
    const result = await viewAllBuyersService();
    return res.status(200).json(result);
  } catch (error) {
    console.error("View all buyers controller error:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};

// View buyer by ID 
export const viewBuyerById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await viewBuyerByIdService(id);
    
    return res.status(result.status === "SUCCESS" ? 200 : 404).json(result);
  } catch (error) {
    console.error("View buyer by ID controller error:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};

// Update buyer 
export const updateBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const result = await updateBuyerService(id, updateData);
    
    return res.status(result.status === "SUCCESS" ? 200 : 400).json(result);
  } catch (error) {
    console.error("Update buyer controller error:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};

// Toggle buyer status ACTIVE/INACTIVE (Admin only)
export const toggleBuyerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await toggleBuyerStatusService(id);
    
    return res.status(result.status === "SUCCESS" ? 200 : 400).json(result);
  } catch (error) {
    console.error("Toggle buyer status controller error:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};