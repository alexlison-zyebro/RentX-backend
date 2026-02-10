import { getSellerEarningsService } from "../services/earnings.service.js";

export const getSellerEarnings = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    
    let { startDate, endDate } = req.query;
    
    if (startDate) {
      if (startDate.includes('/')) {
        const [day, month, year] = startDate.split('/');
        startDate = `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    if (endDate) {
      if (endDate.includes('/')) {
        const [day, month, year] = endDate.split('/');
        endDate = `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    const result = await getSellerEarningsService(sellerId, startDate, endDate);
    
    return res.status(result.status === "SUCCESS" ? 200 : 400).json(result);
    
  } catch (error) {
    console.error("Get seller earnings controller error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};