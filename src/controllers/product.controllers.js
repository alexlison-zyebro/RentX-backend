import {
  addProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  toggleProductAvailabilityService
} from "../services/product.service.js";

// Add Product Controller
export const addProduct = async (req, res) => {
  try {
    const userId = req.user.userId;

        
    console.log("DEBUG - Add Product Request:");
    console.log("User ID from token:", userId);
    console.log("Request body:", req.body);
    console.log("File:", req.file ? req.file.filename : "No file");
    
    if (!req.file) {
      return res.status(400).json({
        status: "FAILED",
        message: "Product image is required"
      });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const productData = {
      name: req.body.name,
      categoryId: req.body.categoryId,
      description: req.body.description,
      quantity: parseInt(req.body.quantity),
      pricePerDay: parseFloat(req.body.pricePerDay)
    };

    const result = await addProductService(productData,userId, imagePath);

    if (result.status === "SUCCESS") {
      return res.status(201).json({
        status: result.status,
        message: result.message,
        data: result.data
      });
    } else {
      return res.status(
        result.status === "NOT_FOUND" ? 404 :
        result.status === "FORBIDDEN" ? 403 : 400
      ).json({
        status: result.status,
        message: result.message,
        data: result.data
      });
    }

  } catch (error) {
    console.error("Add product controller error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Failed to add product",
      data: null
    });
  }
};

// Get All Products Controller
export const getAllProducts = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await getAllProductsService(userId);

    if (result.status === "SUCCESS") {
      return res.status(200).json({
        status: result.status,
        message: result.message,
        data: result.data,
        count: result.count
      });
    } else {
      return res.status(400).json({
        status: result.status,
        message: result.message,
        data: result.data
      });
    }

  } catch (error) {
    console.error("Get all products controller error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Failed to retrieve products",
      data: null
    });
  }
};

// Get Single Product Controller
export const getProductById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = req.params.id;

    const result = await getProductByIdService(productId, userId);

    if (result.status === "SUCCESS") {
      return res.status(200).json({
        status: result.status,
        message: result.message,
        data: result.data
      });
    } else if (result.status === "NOT_FOUND") {
      return res.status(404).json({
        status: result.status,
        message: result.message,
        data: result.data
      });
    } else {
      return res.status(400).json({
        status: result.status,
        message: result.message,
        data: result.data
      });
    }

  } catch (error) {
    console.error("Get product by ID controller error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Failed to retrieve product",
      data: null
    });
  }
};

// Update Product Controller
export const updateProduct = async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = req.params.id;
    let imagePath = null;

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const updateData = {
      name: req.body.name,
      categoryId: req.body.categoryId,
      description: req.body.description,
      pricePerDay: req.body.pricePerDay,
      quantity: req.body.quantity,
      isAvailable: req.body.isAvailable
    };

    const result = await updateProductService(productId,userId, updateData, imagePath);

    if (result.status === "SUCCESS") {
      return res.status(200).json({
        status: result.status,
        message: result.message,
        data: result.data
      });
    } else if (result.status === "NOT_FOUND") {
      return res.status(404).json({
        status: result.status,
        message: result.message,
        data: result.data
      });
    } else {
      return res.status(400).json({
        status: result.status,
        message: result.message,
        data: result.data
      });
    }

  } catch (error) {
    console.error("Update product controller error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Failed to update product",
      data: null
    });
  }
};

// Toggle Product Availability Controller
export const toggleProductAvailability = async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = req.params.id;

    const result = await toggleProductAvailabilityService(productId, userId);

    if (result.status === "SUCCESS") {
      return res.status(200).json({
        status: result.status,
        message: result.message,
        data: result.data
      });
    } else if (result.status === "NOT_FOUND") {
      return res.status(404).json({
        status: result.status,
        message: result.message,
        data: result.data
      });
    } else {
      return res.status(400).json({
        status: result.status,
        message: result.message,
        data: result.data
      });
    }

  } catch (error) {
    console.error("Toggle product availability controller error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Failed to toggle product availability",
      data: null
    });
  }
};