import { getSellerEarningsService } from "../services/earnings.service.js";

export const getSellerEarnings = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    
    const result = await getSellerEarningsService(sellerId);

    return res.status(result.status === "SUCCESS" ? 200 : 400).json(result);

  } catch (error) {
    console.error("Get seller earnings controller error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};