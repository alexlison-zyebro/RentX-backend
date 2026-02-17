import RentRequest from "../models/RentRequest.js";

export const getSellerEarningsService = async (sellerId, startDate, endDate) => {
  try {
    const baseQuery = { sellerId, status: "COMPLETED" };
    
    // If no dates provided, get all completed requests
    let completedRequests;
    if (!startDate && !endDate) {
      completedRequests = await RentRequest.find(baseQuery);
    } else {
      // Create date objects
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      // Adjust dates to cover full days
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);
      
      // Build date query
      const dateQuery = {};
      if (start) dateQuery.$gte = start;
      if (end) dateQuery.$lte = end;
      
      completedRequests = await RentRequest.find({
        ...baseQuery,
        completedAt: dateQuery
      });
    }
    
    // Get current month and year for calculations
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let totalIncome = 0;
    let monthlyIncome = 0;
    let yearlyIncome = 0;
    
    // Calculate all earnings
    completedRequests.forEach(request => {
      const amount = request.totalAmount || 0;
      
      // Add to total (this is either filtered or all)
      totalIncome += amount;
      
      // Check for monthly and yearly
      if (request.completedAt) {
        const completedDate = new Date(request.completedAt);
        
        // This month's earnings
        if (completedDate.getMonth() === currentMonth && 
            completedDate.getFullYear() === currentYear) {
          monthlyIncome += amount;
        }
        
        // This year's earnings
        if (completedDate.getFullYear() === currentYear) {
          yearlyIncome += amount;
        }
      }
    });
    
    return {
      status: "SUCCESS",
      data: {
        totalIncome,  
        monthlyIncome,
        yearlyIncome,
        totalRentals: completedRequests.length,
        startDate: startDate || null,
        endDate: endDate || null
      }
    };
    
  } catch (error) {
    console.error("Get seller earnings service error:", error);
    return {
      status: "FAILED",
      message: "Failed to retrieve earnings"
    };
  }
};