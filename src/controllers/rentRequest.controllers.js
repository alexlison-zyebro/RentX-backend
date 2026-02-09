import {
  createRentRequestService,
  getBuyerRentRequestsService,
  getSellerRentRequestsService,
  approveOrRejectRequestService,
  updateRentRequestStatusService,
  getRentRequestByIdService
} from "../services/rentRequest.service.js";

// Create Rent Request
export const createRentRequest = async (req, res) => {
  try {
    const buyerId = req.user.userId;
    const { productId, quantity, startDate, endDate } = req.body;

    if (!productId || !quantity || !startDate || !endDate) {
      return res.status(400).json({
        status: "FAILED",
        message: "All fields are required"
      });
    }

    const result = await createRentRequestService({
      productId,
      buyerId,
      quantity: parseInt(quantity),
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    if (result.status === "SUCCESS") {
      return res.status(201).json(result);
    } else {
      const statusCode = result.status === "NOT_FOUND" ? 404 :
                        result.status === "FORBIDDEN" ? 403 : 400;
      return res.status(statusCode).json(result);
    }

  } catch (error) {
    console.error("Create rent request error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};

// Get Buyer Rent Requests
export const getBuyerRentRequests = async (req, res) => {
  try {
    const buyerId = req.user.userId;
    const result = await getBuyerRentRequestsService(buyerId);
    
    return res.status(result.status === "SUCCESS" ? 200 : 400).json(result);

  } catch (error) {
    console.error("Get buyer rent requests error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};

// Get Seller Rent Requests
export const getSellerRentRequests = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const result = await getSellerRentRequestsService(sellerId);
    
    return res.status(result.status === "SUCCESS" ? 200 : 400).json(result);

  } catch (error) {
    console.error("Get seller rent requests error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};

// Approve or Reject Request
export const approveOrRejectRequest = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const { requestId } = req.params;
    const { action, rejectionReason } = req.body;

    if (!action || !["ACCEPTED", "REJECTED"].includes(action)) {
      return res.status(400).json({
        status: "FAILED",
        message: "Action must be ACCEPTED or REJECTED"
      });
    }

    const result = await approveOrRejectRequestService(
      requestId,
      sellerId,
      action,
      rejectionReason
    );

    const statusCode = result.status === "SUCCESS" ? 200 :
                      result.status === "NOT_FOUND" ? 404 :
                      result.status === "FORBIDDEN" ? 403 : 400;
    return res.status(statusCode).json(result);

  } catch (error) {
    console.error("Approve/reject request error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};

// Update Status (Collected, Completed)
export const updateRentRequestStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestId } = req.params;
    const { status } = req.body;

    if (!status || !["COLLECTED", "COMPLETED"].includes(status)) {
      return res.status(400).json({
        status: "FAILED",
        message: "Status must be COLLECTED or COMPLETED"
      });
    }

    const result = await updateRentRequestStatusService(
      requestId,
      userId,
      status
    );

    const statusCode = result.status === "SUCCESS" ? 200 :
                      result.status === "NOT_FOUND" ? 404 :
                      result.status === "FORBIDDEN" ? 403 : 400;
    return res.status(statusCode).json(result);

  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};

// Get Single Rent Request
export const getRentRequestById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestId } = req.body;

    const result = await getRentRequestByIdService(requestId, userId);

    const statusCode = result.status === "SUCCESS" ? 200 :
                      result.status === "NOT_FOUND" ? 404 :
                      result.status === "FORBIDDEN" ? 403 : 400;
    return res.status(statusCode).json(result);

  } catch (error) {
    console.error("Get rent request error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};