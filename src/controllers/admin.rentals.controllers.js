import { getAdminRentalsService } from "../services/admin.rental.service.js";

export const getAdminRentals = async (req, res) => {
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
    } = req.body;

    const result = await getAdminRentalsService({
      statusGroup,
      startDate,
      endDate,
      month,
      year,
      sellerId,
      buyerId,
      productId,
      status
    });

    if (result.status === "SUCCESS") {
      return res.status(200).json({
        success: true,
        message: "Rentals fetched successfully",
        data: result.data,
        summary: result.summary
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

  } catch (error) {
    console.error("Admin rentals error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};