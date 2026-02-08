
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// Add Product Service
export const addProductService = async (productData,userId, imagePath) => {
  try {
    const categoryExists = await Category.findById(productData.categoryId);
    if (!categoryExists) {
      return {
        status: "NOT_FOUND",
        message: "Category not found",
        data: null
      };
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return {
        status: "NOT_FOUND",
        message: "User not found",
        data: null
      };
    }

    if (!userExists.role.includes("SELLER")) {
      return {
        status: "FORBIDDEN",
        message: "Only sellers can add products",
        data: null
      };
    }

    const newProduct = await Product.create({
      name: productData.name,
      categoryId: productData.categoryId,
      description: productData.description,
      pricePerDay: productData.pricePerDay,
      userId: userId,
      quantity: productData.quantity,
      remaining_quantity: productData.quantity,
      image: imagePath,
      isAvailable: true
    });

    return {
      status: "SUCCESS",
      message: "Product added successfully",
      data: newProduct
    };

  } catch (error) {
    console.error("Add product service error:", error);
    return {
      status: "FAILED",
      message: "Failed to add product",
      data: null
    };
  }
};

// Get MY Products Service 
export const getMyProductsService = async (userId) => {
  try {
    const userExists = await User.findById(userId);
    if (!userExists) {
      return {
        status: "NOT_FOUND",
        message: "User not found",
        data: null
      };
    }

    if (!userExists.role.includes("SELLER")) {
      return {
        status: "FORBIDDEN",
        message: "Only sellers can view their products",
        data: null
      };
    }

    const products = await Product.find({ userId })
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    return {
      status: "SUCCESS",
      message: "Your products retrieved successfully",
      data: products,
      count: products.length
    };

  } catch (error) {
    console.error("Get my products service error:", error);
    return {
      status: "FAILED",
      message: "Failed to retrieve your products",
      data: null
    };
  }
};

// Get ALL Products Service 
export const getAllProductsService = async () => {
  try {
    const products = await Product.find({ isAvailable: true })
      .populate({
        path: 'categoryId',
        select: 'name'
      })
      .populate({
        path: 'userId',
        select: 'email phone role status',
        transform: (user) => {
          if (!user) return null;
          
          const userData = {
            _id: user._id,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            isSubscribed: user.isSubscribed
          };
          
          if (user.role.includes('SELLER') && user.sellerDetails) {
            userData.sellerDetails = {
              sellerType: user.sellerDetails.sellerType,
              ...(user.sellerDetails.sellerType === 'INDIVIDUAL' && {
                individualName: user.sellerDetails.individualName,
                individualDob: user.sellerDetails.individualDob,
                aadhaarNumber: user.sellerDetails.aadhaarNumber
              }),
              ...(user.sellerDetails.sellerType === 'ORGANIZATION' && {
                organizationName: user.sellerDetails.organizationName
              })
            };
          }
          
          if (user.role.includes('BUYER') && user.buyerDetails) {
            userData.buyerDetails = {
              buyerName: user.buyerDetails.buyerName,
              dob: user.buyerDetails.dob
            };
          }
          
          if (user.address) {
            userData.address = user.address;
          }
          
          return userData;
        }
      })
      .sort({ createdAt: -1 });

    return {
      status: "SUCCESS",
      message: "All products retrieved successfully",
      data: products,
      count: products.length
    };

  } catch (error) {
    console.error("Get all products service error:", error);
    return {
      status: "FAILED",
      message: "Failed to retrieve products",
      data: null
    };
  }
};


// Get Single Product by ID
export const getProductByIdService = async (productId, userId) => {
  try {
    const myProduct = await Product.findOne({
      _id: productId,
      userId
    }).populate("categoryId", "name");

    if (!myProduct) {
      return {
        status: "NOT_FOUND",
        message: "Product not found",
        data: null
      };
    }

    return {
      status: "SUCCESS",
      message: "Product retrieved successfully",
      data: myProduct
    };

  } catch (error) {
    console.error("Get product by ID service error:", error);
    return {
      status: "FAILED",
      message: "Failed to retrieve product",
      data: null
    };
  }
};

// ViewMy products Service
export const viewMyProductsService = async (userId) => {
  try {
    const userExists = await User.findById(userId);
    if (!userExists) {
      return {
        status: "NOT_FOUND",
        message: "User not found",
        data: null
      };
    }

    if (!userExists.role.includes("SELLER")) {
      return {
        status: "FORBIDDEN",
        message: "Only sellers can view their products",
        data: null
      };
    }

    const products = await Product.find({ userId })
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    return {
      status: "SUCCESS",
      message: "Products retrieved successfully",
      data: products,
      count: products.length
    };

  } catch (error) {
    console.error("View my products service error:", error);
    return {
      status: "FAILED",
      message: "Failed to retrieve products",
      data: null
    };
  }
};

export const updateProductService = async (productId, userId, updateData, newImagePath = null) => {
  try {
    const foundProduct = await Product.findOne({ 
      _id: productId,
      userId: userId
    });

    if (!foundProduct) {
      return {
        status: "NOT_FOUND",
        message: "Product not found",
        data: null
      };
    }

    if (newImagePath) {
      foundProduct.image = newImagePath;
    }

    if (updateData.name) foundProduct.name = updateData.name;
    if (updateData.categoryId) foundProduct.categoryId = updateData.categoryId;
    if (updateData.description) foundProduct.description = updateData.description;
    if (updateData.pricePerDay) foundProduct.pricePerDay = updateData.pricePerDay;
    if (updateData.isAvailable !== undefined) foundProduct.isAvailable = updateData.isAvailable;

    // Handle quantity update
    if (updateData.quantity) {
      const newQuantity = parseInt(updateData.quantity);
      const difference = newQuantity - foundProduct.quantity;
      foundProduct.remaining_quantity = foundProduct.remaining_quantity + difference;
      foundProduct.quantity = newQuantity;
      
      if (foundProduct.remaining_quantity < 0) {
        foundProduct.remaining_quantity = 0;
      }
    }

    await foundProduct.save();

    return {
      status: "SUCCESS",
      message: "Product updated successfully",
      data: foundProduct
    };

  } catch (error) {
    console.error("Update product service error:", error);
    return {
      status: "FAILED",
      message: "Failed to update product",
      data: null
    };
  }
};


// Toggle Product Availability (Activate/Inactivate)
export const toggleProductAvailabilityService = async (productId, userId) => {
  try {
    const product = await Product.findOne({
      _id: productId,
      userId
    });

    if (!product) {
      return {
        status: "NOT_FOUND",
        message: "Product not found",
        data: null
      };
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    return {
      status: "SUCCESS",
      message: `Product ${product.isAvailable ? "activated" : "inactivated"} successfully`,
      data: product
    };

  } catch (error) {
    console.error("Toggle product availability service error:", error);
    return {
      status: "FAILED",
      message: "Failed to toggle product availability",
      data: null
    };
  }
};
