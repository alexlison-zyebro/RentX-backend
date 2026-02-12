
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
    const product = await Product.findOne({
      _id: productId,
      userId
    })
    .populate("categoryId", "name")
    .populate({
      path: "userId",
      select: "email phone address sellerDetails role status",
      populate: {
        path: "sellerDetails"
      }
    });

    if (!product) {
      return {
        status: "NOT_FOUND",
        message: "Product not found",
        data: null
      };
    }

    const seller = product.userId || {};
    const sellerDetails = seller.sellerDetails || {};
    
    let sellerName = "N/A";
    if (sellerDetails.sellerType === "INDIVIDUAL") {
      sellerName = sellerDetails.individualName || "N/A";
    } else if (sellerDetails.sellerType === "ORGANIZATION") {
      sellerName = sellerDetails.organizationName || "N/A";
    }

    const address = seller.address || {};
    const fullAddress = [
      address.street,
      address.city,
      address.state,
      address.pincode
    ].filter(Boolean).join(", ") || "N/A";

    const productData = {
      _id: product._id,
      name: product.name,
      description: product.description,
      image: product.image,
      pricePerDay: product.pricePerDay,
      quantity: product.quantity,
      remaining_quantity: product.remaining_quantity,
      isAvailable: product.isAvailable,
      category: product.categoryId?.name || "N/A",
      createdAt: product.createdAt,
      
      seller: {
        _id: seller._id,
        name: sellerName,
        email: seller.email || "N/A",
        phone: seller.phone || "N/A",
        sellerType: sellerDetails.sellerType || "N/A",
        
        street: address.street || "N/A",
        city: address.city || "N/A",
        state: address.state || "N/A",
        pincode: address.pincode || "N/A",
        fullAddress: fullAddress,
        
        isEmailVerified: seller.isEmailVerified || false,
        status: seller.status || "N/A"
      }
    };

    return {
      status: "SUCCESS",
      message: "Product retrieved successfully",
      data: productData
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


// Search Product Service
export const searchProductsService = async (filters = {}) => {
  try {
    const {
      name,
      categoryId,
      city,
      state,
      pincode,
      street,
      minPrice,
      maxPrice
    } = filters;

    let productQuery = { 
      isAvailable: true,
      remaining_quantity: { $gt: 0 }
    };

    if (name) {
      productQuery.name = { $regex: name, $options: 'i' };
    }

    if (categoryId) {
      productQuery.categoryId = categoryId;
    }

    if (minPrice || maxPrice) {
      productQuery.pricePerDay = {};
      if (minPrice) productQuery.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) productQuery.pricePerDay.$lte = Number(maxPrice);
    }

    let products = await Product.find(productQuery)
      .populate('categoryId', 'name')
      .lean();

    if (products.length === 0) {
      return {
        status: "SUCCESS",
        message: "No products found",
        data: [],
        count: 0
      };
    }

    if (city || state || pincode || street) {
      const sellerIds = products.map(p => p.userId.toString());
      
      let locationQuery = { 
        _id: { $in: sellerIds },
        role: "SELLER"
      };
      
      if (city) locationQuery['address.city'] = { $regex: city, $options: 'i' };
      if (state) locationQuery['address.state'] = { $regex: state, $options: 'i' };
      if (pincode) locationQuery['address.pincode'] = pincode;
      if (street) locationQuery['address.street'] = { $regex: street, $options: 'i' };

      const matchingSellers = await User.find(locationQuery).distinct('_id');
      const matchingSellerIds = matchingSellers.map(id => id.toString());

      products = products.filter(p => matchingSellerIds.includes(p.userId.toString()));
    }

    const productIds = products.map(p => p._id);
    
    const finalProducts = await Product.find({ _id: { $in: productIds } })
      .populate('categoryId', 'name')
      .populate({
        path: 'userId',
        select: 'email phone address sellerDetails',
        transform: (user) => {
          if (!user) return null;
          
          let sellerName = "N/A";
          if (user.sellerDetails) {
            sellerName = user.sellerDetails.individualName || 
                        user.sellerDetails.organizationName || 
                        "N/A";
          }

          const address = user.address || {};
          const location = [
            address.city,
            address.state,
            address.pincode
          ].filter(Boolean).join(", ") || "N/A";

          return {
            _id: user._id,
            name: sellerName,
            email: user.email,
            phone: user.phone,
            city: address.city || "N/A",
            state: address.state || "N/A",
            location: location
          };
        }
      })
      .lean();

    const formattedProducts = finalProducts.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      image: product.image,
      pricePerDay: product.pricePerDay,
      remaining_quantity: product.remaining_quantity,
      category: product.categoryId?.name || "N/A",
      seller: product.userId
    }));

    return {
      status: "SUCCESS",
      message: "Products found successfully",
      data: formattedProducts,
      count: formattedProducts.length
    };

  } catch (error) {
    console.error("Search products service error:", error);
    return {
      status: "FAILED",
      message: "Failed to search products: " + error.message,
      data: null
    };
  }
};