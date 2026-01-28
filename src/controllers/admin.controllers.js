import { sendMail } from "../utils/mailer.js";
import {
  getPendingSellersService,
  getSellerByIdService,
  approveSellerService,
  rejectSellerService,
  getAllSellersService
} from "../services/admin.service.js";

// GET ALL PENDING SELLERS 
export const getPendingSellers = async (req, res) => {
  try {
    const result = await getPendingSellersService();

    if (result.status === "SUCCESS") {
      return res.json({
        status: "SUCCESS",
        message: result.data.length > 0 
          ? "Pending sellers retrieved successfully" 
          : "No pending sellers found",
        data: result.data
      });
    }

    res.status(400).json({
      status: result.status,
      message: result.message
    });
    
  } catch (error) {
    console.error("Get pending sellers error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Failed to retrieve pending sellers"
    });
  }
};

/* GET SELLER DETAILS BY ID */
export const getSellerDetails = async (req, res) => {
  try {
    const { sellerId } = req.body;
    const result = await getSellerByIdService(sellerId);

    if (result.status === "SUCCESS") {
      return res.json({
        status: "SUCCESS",
        message: "Seller details retrieved successfully",
        data: result.data
      });
    }

    if (result.status === "SellerNotFound") {
      return res.status(404).json({
        status: "SellerNotFound",
        message: result.message
      });
    }

    res.status(400).json({
      status: result.status,
      message: result.message
    });
    
  } catch (error) {
    console.error("Get seller details error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Failed to retrieve seller details"
    });
  }
};

// APPROVE SELLER ACCOUNT 
export const approveSeller = async (req, res) => {
  try {
    const { sellerId } = req.body;
    const result = await approveSellerService(sellerId);

    if (result.status === "SUCCESS") {
      const seller = result.data;

      // Send approval email
      await sendMail(
        seller.email,
        "RentX Seller Account Approved",
        `
          <h3>Congratulations! Your Seller Account Has Been Approved</h3>
          <p>Dear ${seller.sellerDetails?.individualName || seller.buyerDetails?.buyerName || "Seller"},</p>
          <p>Your seller account request has been <b>approved</b> by the admin.</p>
          <p>You can now login to your account and start listing products on RentX.</p>
          <br/>
          <p>Best regards,</p>
          <p>RentX Team</p>
        `
      );

      return res.json({
        status: "SUCCESS",
        message: "Seller account approved successfully"
      });
    }

    if (result.status === "NotFound") {
      return res.status(404).json({
        status: "NotFound",
        message: result.message
      });
    }

    res.status(400).json({
      status: result.status,
      message: result.message
    });
    
  } catch (error) {
    console.error("Approve seller error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Failed to approve seller account"
    });
  }
};

// REJECT SELLER ACCOUNT 
export const rejectSeller = async (req, res) => {
  try {
    const { sellerId, rejectionReason } = req.body; 

    if (!rejectionReason) {
      return res.status(400).json({
        status: "ValidationError",
        message: "Rejection reason is required"
      });
    }

    const result = await rejectSellerService(sellerId);

    if (result.status === "SUCCESS") {
      const seller = result.data;

      // Send rejection email with reason
      await sendMail(
        seller.email,
        "RentX Seller Account Request Status",
        `
          <h3>Seller Account Request Update</h3>
          <p>Dear ${seller.sellerDetails?.individualName || seller.buyerDetails?.buyerName || "Seller"},</p>
          <p>We regret to inform you that your seller account request has been <b>rejected</b>.</p>
          <p><b>Reason:</b> ${rejectionReason}</p>
          <p>If you believe this is a mistake or would like to appeal, please contact our support team.</p>
          <br/>
          <p>Best regards,</p>
          <p>RentX Team</p>
        `
      );

      return res.json({
        status: "SUCCESS",
        message: "Seller account rejected successfully"
      });
    }

    if (result.status === "NotFound") {
      return res.status(404).json({
        status: "NotFound",
        message: result.message
      });
    }

    res.status(400).json({
      status: result.status,
      message: result.message
    });
    
  } catch (error) {
    console.error("Reject seller error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Failed to reject seller account"
    });
  }
};

// GET ALL SELLERS 
export const getAllSellers = async (req, res) => {
  try {
    const result = await getAllSellersService();

    if (result.status === "SUCCESS") {
      return res.json({
        status: "SUCCESS",
        message: result.data.length > 0
          ? "Sellers retrieved successfully"
          : "No sellers found",
        data: result.data
      });
    }

    res.status(400).json({
      status: result.status,
      message: result.message
    });
    
  } catch (error) {
    console.error("Get all sellers error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Failed to retrieve sellers"
    });
  }
};