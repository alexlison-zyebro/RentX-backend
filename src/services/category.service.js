import Category from "../models/Category.js";

// Add Category Service
export const addCategoryService = async (name) => {
  try {
    const existingCategory = await Category.findOne({ name });
    
    if (existingCategory) {
      return {
        status: "FAILED",
        message: "Category already exists",
        data: null
      };
    }
      
      const newCategory = await Category.create({
      name,
      isActive: true,
      createdAt: new Date()
    });
    
    return {
      status: "SUCCESS",
      message: "Category added successfully",
      data: newCategory
    };
    
  } catch (error) {
    console.error("Add category service error:", error);
    return {
      status: "FAILED",
      message: "Failed to add category",
      data: null
    };
  }
};

// View All Categories Service
export const viewAllCategoriesService = async () => {
  try {
    const categories = await Category.find({})
      .sort({ createdAt: -1 })
      .select('-__v');
    
    return {
      status: "SUCCESS",
      message: "Categories retrieved successfully",
      data: categories,
      count: categories.length
    };
    
  } catch (error) {
    console.error("View all categories service error:", error);
    return {
      status: "FAILED",
      message: "Failed to retrieve categories",
      data: null
    };
  }
};

// Update Category Service
export const updateCategoryService = async (id, name) => {
  try {
    const existingCategory = await Category.findById(id);
    
    if (!existingCategory) {
      return {
        status: "NOT_FOUND",
        message: "Category not found",
        data: null
      };
    }
    
    
    const duplicateCategory = await Category.findOne({
      name,
      _id: { $ne: id }
    });
    
    if (duplicateCategory) {
      return {
        status: "FAILED",
        message: "Category name already exists",
        data: null
      };
    }
    
    // Update category
    existingCategory.name = name;
    await existingCategory.save();
    
    return {
      status: "SUCCESS",
      message: "Category updated successfully",
      data: existingCategory
    };
    
  } catch (error) {
    console.error("Update category service error:", error);
    return {
      status: "FAILED",
      message: "Failed to update category",
      data: null
    };
  }
};

// Delete Category Service
export const deleteCategoryService = async (id) => {
  try {
    const existingCategory = await Category.findById(id);
    
    if (!existingCategory) {
      return {
        status: "NOT_FOUND",
        message: "Category not found",
        data: null
      };
    }
    
    // Delete category
    await Category.findByIdAndDelete(id);
    
    return {
      status: "SUCCESS",
      message: "Category deleted successfully",
      data: null
    };
    
  } catch (error) {
    console.error("Delete category service error:", error);
    return {
      status: "FAILED",
      message: "Failed to delete category",
      data: null
    };
  }
};

// Toggle Category Status Service 
export const toggleCategoryStatusService = async (id) => {
  try {
    const existingCategory = await Category.findById(id);
    
    if (!existingCategory) {
      return {
        status: "NOT_FOUND",
        message: "Category not found",
        data: null
      };
    }
    
    existingCategory.isActive = !existingCategory.isActive;
    await existingCategory.save();
    
    return {
      status: "SUCCESS",
      message: `Category ${existingCategory.isActive ? "activated" : "deactivated"} successfully`,
      data: existingCategory
    };
    
  } catch (error) {
    console.error("Toggle category status service error:", error);
    return {
      status: "FAILED",
      message: "Failed to toggle category status",
      data: null
    };
  }
};