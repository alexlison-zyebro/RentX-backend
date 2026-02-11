import User from "../models/User.js";
import bcrypt from "bcrypt";

// View all buyers (Admin only)
export const viewAllBuyersService = async () => {
  try {
    const buyers = await User.find({ 
      role: { $in: ["BUYER"] }
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return {
      status: "SUCCESS",
      message: "Buyers retrieved successfully",
      data: buyers,
      count: buyers.length,
    };
  } catch (error) {
    console.error("View all buyers service error:", error);
    return {
      status: "FAILED",
      message: "Failed to retrieve buyers",
      data: null,
    };
  }
};

// View buyer by ID 
export const viewBuyerByIdService = async (buyerId) => {
  try {
    const buyer = await User.findOne({
      _id: buyerId,
      role: { $in: ["BUYER"] }
    }).select("-password");

    if (!buyer) {
      return {
        status: "NOT_FOUND",
        message: "Buyer not found",
        data: null,
      };
    }

    return {
      status: "SUCCESS",
      message: "Buyer retrieved successfully",
      data: buyer,
    };
  } catch (error) {
    console.error("View buyer by ID service error:", error);
    return {
      status: "FAILED",
      message: "Failed to retrieve buyer",
      data: null,
    };
  }
};

// Update buyer 
export const updateBuyerService = async (buyerId, updateData) => {
  try {
    const buyer = await User.findOne({
      _id: buyerId,
      role: { $in: ["BUYER"] }
    });

    if (!buyer) {
      return {
        status: "NOT_FOUND",
        message: "Buyer not found",
        data: null,
      };
    }

     // Check if trying to update email
    if (updateData.email && updateData.email !== buyer.email) {
      return {
        status: "BAD_REQUEST",
        message: "Email cannot be changed. Please contact support.",
        data: null,
      };
    }

    if (updateData.password) {
      buyer.password = await bcrypt.hash(updateData.password, 10);
    }

    if (updateData.phone) buyer.phone = updateData.phone;
    if (updateData.address) {
      buyer.address = { ...buyer.address, ...updateData.address };
    }

    if (updateData.buyerDetails) {
      buyer.buyerDetails = { ...buyer.buyerDetails, ...updateData.buyerDetails };
    }

    await buyer.save();

    const buyerResponse = buyer.toObject();
    delete buyerResponse.password;

    return {
      status: "SUCCESS",
      message: "Buyer updated successfully",
      data: buyerResponse,
    };
  } catch (error) {
    console.error("Update buyer service error:", error);
    return {
      status: "FAILED",
      message: "Failed to update buyer",
      data: null,
    };
  }
};

// Toggle buyer status ACTIVE/INACTIVE (Admin only)
export const toggleBuyerStatusService = async (buyerId) => {
  try {
    const buyer = await User.findOne({
      _id: buyerId,
      role: { $in: ["BUYER"] }
    });

    if (!buyer) {
      return {
        status: "NOT_FOUND",
        message: "Buyer not found",
        data: null,
      };
    }

    if (buyer.status === "ACTIVE") {
      buyer.status = "INACTIVE";
    } else if (buyer.status === "INACTIVE") {
      buyer.status = "ACTIVE";
    } else {
      buyer.status = "INACTIVE";
    }

    await buyer.save();

    const buyerResponse = buyer.toObject();
    delete buyerResponse.password;

    return {
      status: "SUCCESS",
      message: `Buyer status changed to ${buyer.status}`,
      data: buyerResponse,
    };
  } catch (error) {
    console.error("Toggle buyer status service error:", error);
    return {
      status: "FAILED",
      message: "Failed to toggle buyer status",
      data: null,
    };
  }
};