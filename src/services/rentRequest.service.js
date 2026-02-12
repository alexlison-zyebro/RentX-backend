import Product from "../models/Product.js";
import RentRequest from "../models/RentRequest.js";
import { sendMail } from "../utils/mailer.js";


// Create Rent Request
export const createRentRequestService = async (requestData) => {
  try {
    const { productId, buyerId, quantity, startDate, endDate } = requestData;
    if (endDate < startDate) {
      return {
        status: "FAILED",
        message: "End date cannot be before start date"
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

    // Check if enough quantity is available
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

    // Check availability for selected dates
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
        select: "email phone buyerName address"
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


// Approve or Reject Request - UPDATED WITH EMAIL
export const approveOrRejectRequestService = async (requestId, sellerId, action, rejectionReason = null) => {
  try {
    const rentRequest = await RentRequest.findById(requestId)
      .populate({
        path: "productId",
        select: "name image pricePerDay description"
      })
      .populate({
        path: "buyerId",
        select: "email phone buyerDetails"
      })
      .populate({
        path: "sellerId",
        select: "email phone address sellerDetails"
      });

    if (!rentRequest) {
      return {
        status: "NOT_FOUND",
        message: "Rent request not found"
      };
    }

    if (rentRequest.sellerId._id.toString() !== sellerId) {
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
    
    // === ACCEPTED EMAIL ===
    if (action === "ACCEPTED") {
      rentRequest.acceptedAt = new Date();
      
      try {
        const buyer = rentRequest.buyerId;
        const seller = rentRequest.sellerId;
        const product = rentRequest.productId;
        
        // Format dates
        const startDate = new Date(rentRequest.startDate).toLocaleDateString('en-IN', {
          day: '2-digit', month: '2-digit', year: 'numeric'
        });
        const endDate = new Date(rentRequest.endDate).toLocaleDateString('en-IN', {
          day: '2-digit', month: '2-digit', year: 'numeric'
        });
        
        // Get seller info
        let sellerName = "Seller";
        let locationType = "";
        let collectionAddress = "";
        
        if (seller.sellerDetails) {
          if (seller.sellerDetails.sellerType === "INDIVIDUAL") {
            sellerName = seller.sellerDetails.individualName || "Individual Seller";
            locationType = "Home";
          } else if (seller.sellerDetails.sellerType === "ORGANIZATION") {
            sellerName = seller.sellerDetails.organizationName || "Organization";
            locationType = "Shop";
          }
        }
        
        // Format address
        const address = seller.address || {};
        const fullAddress = [
          address.street,
          address.city,
          address.state,
          address.pincode
        ].filter(Boolean).join(", ") || "Address not available";
        
        collectionAddress = address.street || fullAddress;
        
        // Email HTML
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; margin-bottom: 5px;">✅ Rent Request Accepted!</h1>
              <p style="color: #4b5563;">Your rental request has been approved</p>
            </div>
            
            <!-- Product Image & Name -->
            <div style="display: flex; align-items: center; gap: 15px; background: #f9fafb; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
              ${product.image ? `
                <img src="http://localhost:4000${product.image}" alt="${product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
              ` : `
                <div style="width: 80px; height: 80px; background: #e5e7eb; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                  📦
                </div>
              `}
              <div>
                <h2 style="margin: 0; color: #1f2937; font-size: 20px;">${product.name}</h2>
                <p style="margin: 5px 0 0; color: #6b7280;">${product.description?.substring(0, 100)}...</p>
              </div>
            </div>
            
            <!-- Rental Details -->
            <div style="margin-bottom: 20px;">
              <h3 style="color: #374151; border-bottom: 2px solid #f97316; padding-bottom: 8px;">📅 Rental Period</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0;"><strong>Start Date:</strong></td><td>${startDate} at 10:00 AM</td></tr>
                <tr><td style="padding: 8px 0;"><strong>End Date:</strong></td><td>${endDate} at 10:00 AM</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Quantity:</strong></td><td>${rentRequest.quantity} item(s)</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Total Days:</strong></td><td>${rentRequest.totalDays} days</td></tr>
              </table>
            </div>
            
            <!-- Payment Summary -->
            <div style="background: #fef2e8; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
              <h3 style="color: #374151; margin-top: 0;">💰 Payment Summary</h3>
              <table style="width: 100%;">
                <tr><td>Price per day:</td><td style="text-align: right;">₹${rentRequest.pricePerDay}</td></tr>
                <tr><td style="padding-top: 10px;"><strong>Total Amount:</strong></td><td style="text-align: right; padding-top: 10px;"><strong style="font-size: 20px; color: #f97316;">₹${rentRequest.totalAmount}</strong></td></tr>
              </table>
            </div>
            
            <!-- Collection Info -->
            <div style="background: #e6f7e6; padding: 15px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #10b981;">
              <h3 style="color: #374151; margin-top: 0;">📍 Collection Details</h3>
              <p style="margin: 5px 0;"><strong>Collect from ${locationType}:</strong></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>${sellerName}</strong></p>
              <p style="margin: 5px 0; color: #4b5563;">${collectionAddress}</p>
              <p style="margin: 5px 0; color: #4b5563;">${fullAddress}</p>
              <p style="margin: 15px 0 0 0; font-weight: bold; color: #10b981;">⏰ Collection Time: ${startDate} at 10:00 AM</p>
            </div>
            
            <!-- Seller Contact -->
            <div style="margin-bottom: 20px;">
              <h3 style="color: #374151;">👤 Seller Contact</h3>
              <p><strong>Name:</strong> ${sellerName}</p>
              <p><strong>Email:</strong> ${seller.email || 'N/A'}</p>
              <p><strong>Phone:</strong> ${seller.phone || 'N/A'}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #f97316; font-size: 18px; font-weight: bold; margin: 0;">RentX</p>
              <p style="color: #9ca3af; font-size: 12px;">Thank you for choosing RentX!</p>
            </div>
          </div>
        `;
        
        await sendMail(
          buyer.email,
          "✅ Your Rent Request Has Been Accepted - RentX",
          emailHtml
        );
      } catch (emailError) {
        console.error("Failed to send acceptance email:", emailError);
      }
    }
    
    // === REJECTED EMAIL ===
    if (action === "REJECTED") {
      rentRequest.rejectionReason = rejectionReason;
      
      // Restore product quantity
      const product = await Product.findById(rentRequest.productId);
      if (product) {
        product.remaining_quantity += rentRequest.quantity;
        await product.save();
      }
      
      try {
        const buyer = rentRequest.buyerId;
        const product = rentRequest.productId;
        
        // Format dates
        const startDate = new Date(rentRequest.startDate).toLocaleDateString('en-IN', {
          day: '2-digit', month: '2-digit', year: 'numeric'
        });
        const endDate = new Date(rentRequest.endDate).toLocaleDateString('en-IN', {
          day: '2-digit', month: '2-digit', year: 'numeric'
        });
        
        // Email HTML
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ef4444; margin-bottom: 5px;"> Rent Request Rejected ❌</h1>
              <p style="color: #4b5563;">Your rental request has been declined</p>
            </div>
            
            <!-- Product Info -->
            <div style="display: flex; align-items: center; gap: 15px; background: #f9fafb; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
              ${product.image ? `
                <img src="http://localhost:4000${product.image}" alt="${product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
              ` : `
                <div style="width: 80px; height: 80px; background: #e5e7eb; border-radius: 8px; display: flex; align-items: center; justify-content: center;">📦</div>
              `}
              <div>
                <h2 style="margin: 0; color: #1f2937; font-size: 20px;">${product.name}</h2>
              </div>
            </div>
            
            <!-- Rejection Reason -->
            <div style="background: #fee2e2; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #ef4444;">
              <h3 style="color: #374151; margin-top: 0; margin-bottom: 10px;">📝 Reason for Rejection</h3>
              <p style="margin: 0; font-size: 16px; color: #b91c1c; font-weight: 500;">"${rejectionReason}"</p>
            </div>
            
            <!-- Requested Period -->
            <div style="margin-bottom: 20px;">
              <h3 style="color: #374151;">📅 Requested Rental Period</h3>
              <p><strong>Start Date:</strong> ${startDate}</p>
              <p><strong>End Date:</strong> ${endDate}</p>
              <p><strong>Quantity:</strong> ${rentRequest.quantity} item(s)</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280;">You can try renting other products or contact support for assistance.</p>
              <p style="color: #f97316; font-size: 18px; font-weight: bold; margin-top: 15px;">RentX</p>
            </div>
          </div>
        `;
        
        await sendMail(
          buyer.email,
          "❌ Your Rent Request Has Been Rejected - RentX",
          emailHtml
        );
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
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

    // Check date validations based on status
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newStatus === "COLLECTED") {
      // Check if today is the start date
      const startDate = new Date(rentRequest.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      if (today < startDate) {
        return {
          status: "FAILED",
          message: `Cannot mark as collected before the rental start date (${startDate.toDateString()})`
        };
      }
    } 
    
    else if (newStatus === "COMPLETED") {
      // Check if today is the end date
      const endDate = new Date(rentRequest.endDate);
      endDate.setHours(0, 0, 0, 0);
      
      if (today < endDate) {
        return {
          status: "FAILED",
          message: `Cannot mark as completed before the rental end date (${endDate.toDateString()})`
        };
      }
    }

    // Update status
    rentRequest.status = newStatus;
    
    if (newStatus === "COLLECTED") {
      rentRequest.collectedAt = new Date();
    } 
    
    else if (newStatus === "COMPLETED") {
      rentRequest.completedAt = new Date();
      // Return quantity to product when rental is completed
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