import { Request, Response } from "express";
import { AuthRequest } from "middlewares/auth.middleware";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  toggleCategoryStatusService,
  updateCategory,
} from "./category.service";
import { AppError } from "utils/appError";

export const createCategoryController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const category = await createCategory(req.body, req.user!.id);
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (err) {
    throw err;
  }
};

export const getAllCategoriesController = async (
  _req: Request,
  res: Response
) => {
  try {
    const categories = await getAllCategories();
    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (err) {
    throw err;
  }
};

export const getCategoryController = async (req: Request, res: Response) => {
  try {
    const category = await getCategoryById(req.params.id);
    res.json({ success: true, data: category });
  } catch (err) {
    throw err;
  }
};

export const updateCategoryController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const category = await updateCategory(req.params.id, req.body);
    res.json({ success: true, data: category });
  } catch (err) {
    throw err;
  }
};

export const deleteCategoryController = async (req: Request, res: Response) => {
  try {
    await deleteCategory(req.params.id);
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    throw err;
  }
};


export const toggleCategoryStatusController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const result = await toggleCategoryStatusService(req.params.id, req.body);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    // Log unexpected error (in production → use logger like Winston/Sentry)
    console.error("Toggle category status error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};