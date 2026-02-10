import RentRequest from "../models/RentRequest.js";

// Simple earnings calculation service
export const getSellerEarningsService = async (sellerId) => {
  try {
    const completedRequests = await RentRequest.find({
      sellerId,
      status: "COMPLETED"
    });

    if (!completedRequests.length) {
      return {
        status: "SUCCESS",
        data: {
          totalIncome: 0,
          monthlyIncome: 0,
          yearlyIncome: 0,
          totalRentals: 0
        }
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalIncome = 0;
    let monthlyIncome = 0;
    let yearlyIncome = 0;

    // Calculate all incomes
    completedRequests.forEach(request => {
      const amount = request.totalAmount || 0;
      totalIncome += amount;

      if (request.completedAt) {
        const completedDate = new Date(request.completedAt);
        
        // Monthly income (current month)
        if (completedDate.getMonth() === currentMonth && 
            completedDate.getFullYear() === currentYear) {
          monthlyIncome += amount;
        }
        
        // Yearly income (current year)
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
        totalRentals: completedRequests.length
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