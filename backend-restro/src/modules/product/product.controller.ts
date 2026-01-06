// src/modules/menu/products/controllers/product.controller.ts
import { Request, Response } from "express";
import { AuthRequest } from "middlewares/auth.middleware";
import {
  createProductService,
  deleteProductService,
  getProductByIdService,
  getProductDetailService,
  listProductsWithPagination,
  toggleProductAvailabilityService,
  updateProductService,
} from "./product.service";
import { AppError } from "utils/appError";

export const createProductController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const product = await createProductService(req.body, req.user!.id);

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const listProductsPaginatedController = async (
  req: Request,
  res: Response
) => {
  try {
    // Extract query params with safe defaults
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    // Validate page and limit (prevent abuse/negative values)
    if (isNaN(page) || page < 1) {
      throw new AppError("Page must be a positive number", 400);
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new AppError("Limit must be between 1 and 100", 400);
    }

    const result = await listProductsWithPagination({
      page,
      limit,
      sortBy: (req.query.sortBy as string) || "createdAt",
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      categoryId: req.query.categoryId as string | undefined,
      isAvailable: req.query.isAvailable as string | undefined,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("List products controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProductDetailsController = async (req: Request, res: Response) => {
  try {
    const product = await getProductByIdService(req.params.id);
    res.json({ success: true, data: product });
  } catch (err) {
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateProductController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const product = await updateProductService(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (err) {
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteProductController = async (req: Request, res: Response) => {
  try {
    await deleteProductService(req.params.id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const toggleProductAvailabilityController = async (
  req: Request,
  res: Response
) => {
  try {
    const { isAvailable } = req.body;
    if (typeof isAvailable !== "boolean") {
      throw new AppError("isAvailable must be boolean", 400);
    }

    const product = await toggleProductAvailabilityService(
      req.params.id,
      isAvailable
    );
    res.json({ success: true, data: product });
  } catch (err) {
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getProductDetailController = async (
  req: Request,
  res: Response
) => {
  try {
    // Extract productId from params
    const { id } = req.params;

    // Call service
    const product = await getProductDetailService(id);

    // Success response
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    // All errors are already AppError or converted
    const status = error instanceof AppError ? error.statusCode : 500;
    const message =
      error instanceof AppError
        ? error.message
        : "Internal server error - please try again later";

    return res.status(status).json({
      success: false,
      message,
    });
  }
};