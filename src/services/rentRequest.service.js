import Product from "../models/Product.js";
import RentRequest from "../models/RentRequest.js";
import User from "../models/User.js";

// Create Rent Request
export const createRentRequestService = async (requestData) => {
  try {
    const { productId, buyerId, quantity, startDate, endDate } = requestData;

    if (endDate <= startDate) {
      return {
        status: "FAILED",
        message: "End date must be after start date"
      };
    }

    if (startDate <= new Date()) {
      return {
        status: "FAILED",
        message: "Start date must be in the future"
      };
    }

    const product = await Product.findById(productId);
    if (!product) {
      return {
        status: "NOT_FOUND",
        message: "Product not found"
      };
    }

    if (product.userId.toString() === buyerId) {
      return {
        status: "FORBIDDEN",
        message: "You cannot rent your own product"
      };
    }

    if (!product.isAvailable) {
      return {
        status: "FAILED",
        message: "Product is not available"
      };
    }

    if (quantity > product.remaining_quantity) {
      return {
        status: "FAILED",
        message: `Only ${product.remaining_quantity} items available`
      };
    }

    // Check for duplicate/overlapping rent requests
    const existingRequest = await RentRequest.findOne({
      productId,
      buyerId,
      status: { $in: ["PENDING", "ACCEPTED", "COLLECTED"] }, 
      $or: [
        { startDate: { $lte: startDate }, endDate: { $gte: startDate } },
        { startDate: { $lte: endDate }, endDate: { $gte: endDate } },
        { startDate: { $gte: startDate }, endDate: { $lte: endDate } }
      ]
    });

    if (existingRequest) {
      return {
        status: "FAILED",
        message: `You already have an active rent request for this product from ${existingRequest.startDate.toDateString()} to ${existingRequest.endDate.toDateString()}`
      };
    }

    const activeRentRequests = await RentRequest.find({
      productId,
      status: { $in: ["PENDING", "ACCEPTED", "COLLECTED"] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });

    let totalReservedQuantity = 0;
    activeRentRequests.forEach(req => {
      totalReservedQuantity += req.quantity;
    });

    if (quantity > (product.quantity - totalReservedQuantity)) {
      return {
        status: "FAILED",
        message: `Only ${product.quantity - totalReservedQuantity} items available for the selected dates`
      };
    }

    // Calculate days and amount
    const diffTime = Math.abs(endDate - startDate);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const totalAmount = totalDays * product.pricePerDay * quantity;

    const rentRequest = await RentRequest.create({
      productId,
      buyerId,
      sellerId: product.userId,
      quantity,
      startDate,
      endDate,
      totalDays,
      pricePerDay: product.pricePerDay,
      totalAmount,
      status: "PENDING"
    });

    product.remaining_quantity -= quantity;
    await product.save();

    return {
      status: "SUCCESS",
      message: "Rent request created successfully",
      data: rentRequest
    };

  } catch (error) {
    console.error("Create rent request service error:", error);
    return {
      status: "FAILED",
      message: "Failed to create rent request"
    };
  }
};

// Get Rent Requests for Buyer
export const getBuyerRentRequestsService = async (buyerId) => {
  try {
    const rentRequests = await RentRequest.find({ buyerId })
      .populate({
        path: "productId",
        select: "name image pricePerDay",
        populate: {
          path: "categoryId",
          select: "name"
        }
      })
      .populate({
        path: "sellerId",
        select: "email phone"
      })
      .sort({ createdAt: -1 });

    return {
      status: "SUCCESS",
      message: "Rent requests retrieved",
      data: rentRequests
    };

  } catch (error) {
    console.error("Get buyer rent requests service error:", error);
    return {
      status: "FAILED",
      message: "Failed to retrieve rent requests"
    };
  }
};

// Get Rent Requests for Seller
export const getSellerRentRequestsService = async (sellerId) => {
  try {
    const rentRequests = await RentRequest.find({ sellerId })
      .populate({
        path: "productId",
        select: "name image pricePerDay"
      })
      .populate({
        path: "buyerId",
        select: "email phone"
      })
      .sort({ createdAt: -1 });

    return {
      status: "SUCCESS",
      message: "Rent requests retrieved",
      data: rentRequests
    };

  } catch (error) {
    console.error("Get seller rent requests service error:", error);
    return {
      status: "FAILED",
      message: "Failed to retrieve rent requests"
    };
  }
};

// Approve or Reject Request
export const approveOrRejectRequestService = async (requestId, sellerId, action, rejectionReason = null) => {
  try {
    const rentRequest = await RentRequest.findById(requestId);
    if (!rentRequest) {
      return {
        status: "NOT_FOUND",
        message: "Rent request not found"
      };
    }

    if (rentRequest.sellerId.toString() !== sellerId) {
      return {
        status: "FORBIDDEN",
        message: "Not authorized"
      };
    }

    if (rentRequest.status !== "PENDING") {
      return {
        status: "FAILED",
        message: `Request is already ${rentRequest.status.toLowerCase()}`
      };
    }

    if (action === "REJECTED" && !rejectionReason) {
      return {
        status: "FAILED",
        message: "Rejection reason is required"
      };
    }

    // Update status
    rentRequest.status = action;
    if (action === "ACCEPTED") {
      rentRequest.acceptedAt = new Date();
    }
    if (action === "REJECTED") {
      rentRequest.rejectionReason = rejectionReason;
      // Return quantity to product when rejected
      const product = await Product.findById(rentRequest.productId);
      if (product) {
        product.remaining_quantity += rentRequest.quantity;
        await product.save();
      }
    }

    await rentRequest.save();

    return {
      status: "SUCCESS",
      message: `Request ${action.toLowerCase()} successfully`,
      data: rentRequest
    };

  } catch (error) {
    console.error("Approve/reject request service error:", error);
    return {
      status: "FAILED",
      message: "Failed to update request status"
    };
  }
};

// Update Status (Collected, Completed)
export const updateRentRequestStatusService = async (requestId, userId, newStatus) => {
  try {
    const rentRequest = await RentRequest.findById(requestId);
    if (!rentRequest) {
      return {
        status: "NOT_FOUND",
        message: "Rent request not found"
      };
    }

    const isSeller = rentRequest.sellerId.toString() === userId;
    if (!isSeller) {
      return {
        status: "FORBIDDEN",
        message: "Only seller can update status"
      };
    }

    const validTransitions = {
      "ACCEPTED": ["COLLECTED"],
      "COLLECTED": ["COMPLETED"]
    };

    if (!validTransitions[rentRequest.status] || !validTransitions[rentRequest.status].includes(newStatus)) {
      return {
        status: "FAILED",
        message: `Cannot change status from ${rentRequest.status} to ${newStatus}`
      };
    }

    // Update status
    rentRequest.status = newStatus;
    
    if (newStatus === "COLLECTED") {
      rentRequest.collectedAt = new Date();
    } else if (newStatus === "COMPLETED") {
      rentRequest.completedAt = new Date();
      const product = await Product.findById(rentRequest.productId);
      if (product) {
        product.remaining_quantity += rentRequest.quantity;
        await product.save();
      }
    }

    await rentRequest.save();

    return {
      status: "SUCCESS",
      message: `Status updated to ${newStatus.toLowerCase()}`,
      data: rentRequest
    };

  } catch (error) {
    console.error("Update rent request status service error:", error);
    return {
      status: "FAILED",
      message: "Failed to update status"
    };
  }
};

// Get Single Rent Request
export const getRentRequestByIdService = async (requestId, userId) => {
  try {
    const rentRequest = await RentRequest.findById(requestId)
      .populate({
        path: "productId",
        select: "name image description pricePerDay"
      })
      .populate({
        path: "buyerId",
        select: "email phone"
      })
      .populate({
        path: "sellerId",
        select: "email phone"
      });

    if (!rentRequest) {
      return {
        status: "NOT_FOUND",
        message: "Rent request not found"
      };
    }

    const isBuyer = rentRequest.buyerId._id.toString() === userId;
    const isSeller = rentRequest.sellerId._id.toString() === userId;
    
    if (!isBuyer && !isSeller) {
      return {
        status: "FORBIDDEN",
        message: "Not authorized"
      };
    }

    return {
      status: "SUCCESS",
      message: "Rent request found",
      data: rentRequest
    };

  } catch (error) {
    console.error("Get rent request by ID service error:", error);
    return {
      status: "FAILED",
      message: "Failed to retrieve rent request"
    };
  }
};