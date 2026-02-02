import { processSubscriptionService } from "../services/subscription.service.js";
import { sendMail } from "../utils/mailer.js";

// Activate subscription
export const activateSubscription = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        status: "FAILED",
        message: "User ID required"
      });
    }

    const result = await processSubscriptionService(userId);

    if (result.status === "SUCCESS") {
      // Send confirmation email
      const User = await import("../models/User.js");
      const user = await User.default.findById(userId);
      
      if (user) {
        await sendMail(
          user.email,
          "RentX Seller Subscription Activated",
          `
            <h3>🎉 Subscription Activated Successfully!</h3>
            <p>Dear ${user.sellerDetails?.individualName || user.buyerDetails?.buyerName || "Seller"},</p>
            
            <p><b>Your RentX Seller Subscription has been activated!</b></p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
              <p><b>Subscription Details:</b></p>
              <p> Amount Paid: <b>₹699</b></p>
              <p> Duration: <b>1 Year</b></p>
              <p> Start Date: ${result.data.subscriptionStartDate.toLocaleDateString()}</p>
              <p> End Date: ${result.data.subscriptionEndDate.toLocaleDateString()}</p>
            </div>
            
            <p>Your seller account is now <b>fully activated</b> and you can:</p>
            <ul>
              <li>List unlimited products for rent/sale</li>
              <li>Manage rental requests</li>
              <li>Update products availability</li>
              <li>Track your rentals</li>
            </ul>
            
            <p>Login to your account and start listing your tools!</p>
            
            <br/>
            <p>Best regards,</p>
            <p><b>RentX Team</b></p>
          `
        );
      }

      return res.json({
        status: "SUCCESS",
        message: "Subscription activated successfully",
        data: result.data
      });
    }

    if (result.status === "userNotFound") {
      return res.status(404).json({
        status: "USER_NOT_FOUND",
        message: result.message
      });
    }

    if (result.status === "notSeller") {
      return res.status(400).json({
        status: "NOT_SELLER",
        message: result.message
      });
    }

    if (result.status === "alreadySubscribed") {
      return res.status(400).json({
        status: "ALREADY_SUBSCRIBED",
        message: result.message
      });
    }

    res.status(400).json({
      status: result.status,
      message: result.message
    });

  } catch (error) {
    console.error("Activate subscription error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Failed to activate subscription"
    });
  }
};


