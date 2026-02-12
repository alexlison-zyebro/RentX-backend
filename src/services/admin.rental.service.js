import RentRequest from "../models/RentRequest.js";

export const getAdminRentalsService = async (filters = {}) => {
  try {
    const {
      statusGroup,
      startDate,
      endDate,
      month,
      year,
      sellerId,
      buyerId,
      productId,
      status
    } = filters;

    let query = {};

    if (statusGroup === "ongoing") {
      query.status = { $in: ["PENDING", "ACCEPTED", "COLLECTED"] };
    } else if (statusGroup === "completed") {
      query.status = "COMPLETED";
    } else if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      query.startDate = { $lte: end };  
      query.endDate = { $gte: start };   
    } 
    else if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      
      query.startDate = { $lte: endOfMonth };
      query.endDate = { $gte: startOfMonth };
    }

    if (sellerId) query.sellerId = sellerId;
    if (buyerId) query.buyerId = buyerId;
    if (productId) query.productId = productId;

    const rentals = await RentRequest.find(query)
      .populate("productId", "name image pricePerDay")
      .populate("buyerId", "email phone buyerDetails")
      .populate("sellerId", "email sellerDetails")
      .sort({ createdAt: -1 });

    const formattedRentals = rentals.map(rental => {
      const product = rental.productId || {};
      const buyer = rental.buyerId || {};
      const seller = rental.sellerId || {};
      
      let customerName = "N/A";
      if (buyer.buyerDetails && buyer.buyerDetails.buyerName) {
        customerName = buyer.buyerDetails.buyerName;
      }
      
      // Get seller name (individualName or organizationName)
      let sellerName = "N/A";
      if (seller.sellerDetails) {
        sellerName = seller.sellerDetails.individualName || 
                    seller.sellerDetails.organizationName || 
                    "N/A";
      }
      
      // Get seller type
      let sellerType = "N/A";
      if (seller.sellerDetails && seller.sellerDetails.sellerType) {
        sellerType = seller.sellerDetails.sellerType;
      }

      return {
        // Customer Details
        customerName: customerName,
        customerEmail: buyer.email || "N/A",
        
        // Product Details
        productImage: product.image || null,
        productName: product.name || "N/A",
        
        // Seller Details
        sellerName: sellerName,
        sellerType: sellerType,
        
        // Rental Details
        pricePerDay: rental.pricePerDay || 0,
        quantity: rental.quantity || 0,
        totalDays: rental.totalDays || 0,
        totalPrice: rental.totalAmount || 0,
        status: rental.status || "N/A",
        
        // Dates
        startDate: rental.startDate,
        endDate: rental.endDate,
        requestedAt: rental.createdAt
      };
    });

    // CALCULATE SUMMARY
    const ongoing = formattedRentals.filter(r => 
      ["PENDING", "ACCEPTED", "COLLECTED"].includes(r.status)
    );
    
    const completed = formattedRentals.filter(r => 
      r.status === "COMPLETED"
    );

    const totalRevenue = completed.reduce((sum, r) => sum + r.totalPrice, 0);

    const summary = {
      totalRentals: formattedRentals.length,
      ongoingCount: ongoing.length,
      completedCount: completed.length,
      totalRevenue: totalRevenue
    };

    return {
      status: "SUCCESS",
      message: "Rentals fetched successfully",
      data: formattedRentals,
      summary: summary
    };

  } catch (error) {
    console.error("Admin rentals service error:", error);
    return {
      status: "FAILED",
      message: "Failed to fetch rentals: " + error.message
    };
  }
};