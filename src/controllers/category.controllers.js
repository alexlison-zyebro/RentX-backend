import {
addCategoryService, deleteCategoryService,
toggleCategoryStatusService, updateCategoryService,
viewAllCategoriesService
} from "../services/category.service.js";


export const addCategory = async (req, res) => {

    try {

        const { name } = req.body;

        const result = await addCategoryService(name);

        if (result.status === "SUCCESS") {

            return res.status(200).json(result);
        }

        if (result.status === "FAILED") {

            return res.status(400).json(result);
        }

        res.status(500).json(result);

    } catch (error) {
        console.error("error in creating Category:", error);
        res.status(500).json({
            status: "FAILED",
            message: "Server error"
        });

    }
}

// view All Category

export const viewAllCategories = async (req, res) => {

    try {

        const result = await viewAllCategoriesService();

        if (result.status === "SUCCESS") {

            return res.json(result);

        }


    } catch (error) {

        console.log("Error in Retreiving Categories: ", error);
        res.status(500).json({
            status: "FAILED",
            message: "Server error"
        });

    }

}

// update Category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const result = await updateCategoryService(id, name);

        if (result.status === "SUCCESS") {
            return res.json(result);
        }

        if (result.status === "NOT_FOUND") {
            return res.status(404).json(result);
        }

        if (result.status === "FAILED") {
            return res.status(400).json(result);
        }

        res.status(500).json(result);

    } catch (error) {
        console.error("Update category controller error:", error);
        res.status(500).json({
            status: "FAILED",
            message: "Server error"
        });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await deleteCategoryService(id);

        if (result.status === "SUCCESS") {
            return res.json(result);
        }

        if (result.status === "NOT_FOUND") {
            return res.status(404).json(result);
        }

        res.status(500).json(result);

    } catch (error) {
        console.error("Delete category controller error:", error);
        res.status(500).json({
            status: "FAILED",
            message: "Server error"
        });
    }
};


// Toggle category status
export const toggleCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await toggleCategoryStatusService(id);

        if (result.status === "SUCCESS") {
            return res.json(result);
        }

        if (result.status === "NOT_FOUND") {
            return res.status(404).json(result);
        }

        res.status(500).json(result);

    } catch (error) {
        console.error("Toggle category status controller error:", error);
        res.status(500).json({
            status: "FAILED",
            message: "Server error"
        });
    }
};
