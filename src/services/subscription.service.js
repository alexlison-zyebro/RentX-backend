import User from "../models/User.js"

// Subscription Setup

export const processSubscriptionService = async (userId) => {

    try {

        const user = await User.findById(userId);

        if(!user){

            return {
                status: "userNotFound",
                message: "User Not Found"
            };
        }
        
        if(!user.role.includes("SELLER")) {

            return {
                status: "notSeller",
                message: "Only Sellers Need Subscription"
            };
        }

        if(user.isSubscribed && new Date(user.subscriptionEndDate) > new Date()) {

            return {

                status: "alreadySubscribed",
                message: "Already has Active Subscription"
            };
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);

        user.isSubscribed = true;
        user.subscriptionStartDate = startDate;
        user.subscriptionEndDate = endDate;
        user.status = "ACTIVE";

        await user.save();

            return {
            status: "SUCCESS",
            message: "Subscription activated",
            data: {
            subscriptionStartDate: startDate,
            subscriptionEndDate: endDate,
            isSubscribed: true
            }
        };

    } catch (error) {

        console.error("Subscription service error:", error);
        return {
            status: "FAILED",
            message: "Subscription failed"
        };
        
    }
}

