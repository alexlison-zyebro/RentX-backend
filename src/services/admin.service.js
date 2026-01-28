import User from "../models/User.js"

// get Sellers Info
export const getPendingSellersService = async () => {

    try {

        const pendingSellers = await User.find({
            status: "PENDING"
        }).select("-password");

        return {
            status : "SUCCESS",
            data : pendingSellers
        }
        
    } catch (error) {

        throw new Error("Failed to Retrieve Pending Sellers Data");
        
    }
}

// Get Seller By Id

export const getSellerByIdService = async (sellerId) => {

    try {

        const seller = await User.findOne({
            _id: sellerId
        }).select("-password");

        if(!seller) 
        {
            return {
                status : "SellerNotFound",
                message: "Seller Not Found"
            };
        }

        return {
           status: "SUCCESS",
           data: seller
        };
        
    } catch (error) {

        throw new Error("Failed to Retrieve Seller Details");
        
    }
}

// Approve Seller Accounts

export const approveSellerService = async (sellerId) => {

    try {

        const seller = await User.findOne({
            _id : sellerId,
            status : "PENDING"
        }).select("-password");
        
        if(!seller) {

            return {
                status: "NotFound",
                message: "Pending seller not found"
            }
        }

        seller.status = "APPROVED";
        await seller.save();

        return {
            status : "SUCCESS",
            data : seller
        };

    } catch (error) {

         throw new Error("Failed to approve seller account")
        
    }
};

export const rejectSellerService = async(sellerId) => {

    try {

        const seller = await User.findOne({
            _id : sellerId,
            status : "PENDING"
        }).select("-password");

        if(!seller)
        {
            return {
                 status: "NotFound",
                 message: "Pending seller not found"

            }
        }

        seller.status = "REJECTED";

        await seller.save();

        return {
            status: "SUCCESS",
            data: seller
        };

        
    } catch (error) {
        
         throw new Error("Failed to reject seller account");
    }

}

// Get all Sellers 

export const getAllSellersService = async () => {
  try {
    const sellers = await User.find({
        role : "SELLER"
    }).select("-password");

    return {
      status: "SUCCESS",
      data: sellers
    };
  } catch (error) {
    throw new Error("Failed to retrieve sellers");
  }
};