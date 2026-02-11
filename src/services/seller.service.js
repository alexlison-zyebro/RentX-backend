import User from "../models/User.js";
import bcrypt from "bcrypt";

// View all sellers (Admin only)
export const viewAllSellersService = async () => {
  try {
    const sellers = await User.find({ 
      role: { $in: ["SELLER"] },
      status: { $ne: "PENDING" }
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return {
      status: "SUCCESS",
      message: "Sellers retrieved successfully",
      data: sellers,
      count: sellers.length,
    };
  } catch (error) {
    console.error("View all sellers service error:", error);
    return {
      status: "FAILED",
      message: "Failed to retrieve sellers",
      data: null,
    };
  }
};

// View seller by ID 
export const viewSellerByIdService = async (sellerId) => {
  try {
    const seller = await User.findOne({
      _id: sellerId,
      role: { $in: ["SELLER"] }
    }).select("-password");

    if (!seller) {
      return {
        status: "NOT_FOUND",
        message: "Seller not found",
        data: null,
      };
    }

    return {
      status: "SUCCESS",
      message: "Seller retrieved successfully",
      data: seller,
    };
  } catch (error) {
    console.error("View seller by ID service error:", error);
    return {
      status: "FAILED",
      message: "Failed to retrieve seller",
      data: null,
    };
  }
};

// Update seller 
export const updateSellerService = async (sellerId, updateData) => {
  try {
    const seller = await User.findOne({
      _id: sellerId,
      role: { $in: ["SELLER"] }
    });

    if (!seller) {
      return {
        status: "NOT_FOUND",
        message: "Seller not found",
        data: null,
      };
    }

    // Check if trying to update email
    if (updateData.email && updateData.email !== seller.email) {
      return {
        status: "BAD_REQUEST",
        message: "Email cannot be changed. Please contact support.",
        data: null,
      };
    }

    if (updateData.password) {
      seller.password = await bcrypt.hash(updateData.password, 10);
    }

    if (updateData.phone) seller.phone = updateData.phone;
    if (updateData.address) {
      seller.address = { ...seller.address, ...updateData.address };
    }

    if (updateData.sellerDetails) {
      seller.sellerDetails = { ...seller.sellerDetails, ...updateData.sellerDetails };
    }

    await seller.save();

    const sellerResponse = seller.toObject();
    delete sellerResponse.password;

    return {
      status: "SUCCESS",
      message: "Seller updated successfully",
      data: sellerResponse,
    };
  } catch (error) {
    console.error("Update seller service error:", error);
    return {
      status: "FAILED",
      message: "Failed to update seller",
      data: null,
    };
  }
};

// Toggle seller status ACTIVE/INACTIVE (Admin only)
export const toggleSellerStatusService = async (sellerId) => {
  try {
    const seller = await User.findOne({
      _id: sellerId,
      role: { $in: ["SELLER"] }
    });

    if (!seller) {
      return {
        status: "NOT_FOUND",
        message: "Seller not found",
        data: null,
      };
    }

    if (seller.status === "ACTIVE") {
      seller.status = "INACTIVE";
    } else if (seller.status === "INACTIVE") {
      seller.status = "ACTIVE";
    } else {
      seller.status = "INACTIVE";
    }

    await seller.save();

    const sellerResponse = seller.toObject();
    delete sellerResponse.password;

    return {
      status: "SUCCESS",
      message: `Seller status changed to ${seller.status}`,
      data: sellerResponse,
    };
  } catch (error) {
    console.error("Toggle seller status service error:", error);
    return {
      status: "FAILED",
      message: "Failed to toggle seller status",
      data: null,
    };
  }
};