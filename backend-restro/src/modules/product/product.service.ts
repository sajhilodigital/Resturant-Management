// src/modules/menu/products/services/product.service.ts

import { CategoryTable } from "modules/category/category.model";
import { IProduct, ProductTable } from "./product.model";
import { createProductSchema, updateProductSchema } from "./product.validation";
import { AppError } from "utils/appError";
import { Types } from "mongoose";
import { PaginatedProducts, PaginationOptions } from "types/user.interface";

// ─────────────────────────────────────────────────────────────
// 1. Create Product
// ─────────────────────────────────────────────────────────────
export const createProductService = async (
  data: unknown,
  createdBy: string
): Promise<IProduct> => {
  try {
    // 1. Validate input data
    const validated = createProductSchema.parse(data);

    console.log(validated);

    // 2. Check if category exists
    const category = await CategoryTable.findById(validated.categoryId);

    console.log(category);
    if (!category) {
      throw new AppError("Category not found", 404);
    }

    // 3. Optional: Check if product name already exists in same category (business rule)
    const duplicate = await ProductTable.exists({
      name: validated.name,
      description: validated.description,
      basePrice: validated.basePrice,
      categoryId: validated.categoryId,
      isActive: true,
    });
    if (duplicate) {
      throw new AppError(
        "Product with this name, description, basePrice already exists in the category",
        409
      );
    }

    // 4. Create product
    const product = await ProductTable.create({
      ...validated,
      createdBy: new Types.ObjectId(createdBy),
    });

    return product;
  } catch (error) {
    if (error instanceof AppError) {
      throw error; // re-throw known errors (404, 409, etc.)
    }

    // Unexpected database or system errors
    console.error("Create product error:", error);
    throw new AppError("Failed to create product - internal server error", 500);
  }
};

// 2. Get All Products (with filters)
export const listProductsWithPagination = async (
  options: PaginationOptions
): Promise<PaginatedProducts> => {
  try {
    const {
      page,
      limit,
      sortBy = "createdAt", // default: latest first
      sortOrder = "desc", // default: newest first
      categoryId,
      isAvailable,
    } = options;

    // Build safe query
    const query: any = { isActive: true };

    if (categoryId) {
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new AppError("Invalid category ID", 400);
      }
      query.categoryId = categoryId;
    }

    if (isAvailable !== undefined) {
      const isAvail = isAvailable === "true" ? true : false;
      query.isAvailable = isAvail;
    }

    // Dynamic sorting (allow frontend to override)
    const validSortFields = ["name", "basePrice", "displayOrder", "createdAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sort: Record<string, 1 | -1> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Execute paginated query
    const [products, totalItems] = await Promise.all([
      ProductTable.find(query)
        .populate("categoryId", "name")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .select("-__v"),
      ProductTable.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  } catch (error) {
    if (error instanceof AppError) throw error;

    console.error("List products paginated error:", error);
    throw new AppError("Failed to fetch products - internal server error", 500);
  }
};

// ─────────────────────────────────────────────────────────────
// 3. Get Product by ID
// ─────────────────────────────────────────────────────────────
export const getProductByIdService = async (id: string): Promise<IProduct> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid product ID", 400);
    }

    const product = await ProductTable.findById(id)
      .populate("categoryId", "name")
      .lean()
      .select("-__v");

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return product;
  } catch (error) {
    if (error instanceof AppError) throw error;

    console.error("Get product by ID error:", error);
    throw new AppError("Failed to fetch product - internal server error", 500);
  }
};

// ─────────────────────────────────────────────────────────────
// 4. Update Product
// ─────────────────────────────────────────────────────────────
export const updateProductService = async (
  id: string,
  data: unknown
): Promise<IProduct> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid product ID", 400);
    }

    const validated = updateProductSchema.parse(data);

    // If category is being updated → validate existence
    if (validated.categoryId) {
      const categoryExists = await CategoryTable.exists({
        _id: validated.categoryId,
      });
      if (!categoryExists) {
        throw new AppError("New category does not exist", 404);
      }
    }

    const updatedProduct = await ProductTable.findByIdAndUpdate(id, validated, {
      new: true,
      runValidators: true,
      select: "-__v",
    });

    if (!updatedProduct) {
      throw new AppError("Product not found", 404);
    }

    return updatedProduct;
  } catch (error) {
    if (error instanceof AppError) throw error;

    console.error("Update product error:", error);
    throw new AppError("Failed to update product - internal server error", 500);
  }
};

// ─────────────────────────────────────────────────────────────
// 5. Soft Delete Product
// ─────────────────────────────────────────────────────────────
export const deleteProductService = async (id: string): Promise<void> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid product ID", 400);
    }

    const product = await ProductTable.findById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Optional business rule: cannot delete if it's in active orders
    // const inActiveOrder = await Order.exists({ "items.productId": id, status: { $nin: ['served', 'cancelled'] } });
    // if (inActiveOrder) throw new AppError("Cannot delete product in active orders", 409);

    const result = await ProductTable.updateOne(
      { _id: id },
      { $set: { isActive: false } }
    );

    if (result.modifiedCount === 0) {
      throw new AppError("Product could not be deactivated", 500);
    }
  } catch (error) {
    if (error instanceof AppError) throw error;

    console.error("Delete product error:", error);
    throw new AppError("Failed to delete product - internal server error", 500);
  }
};

// ─────────────────────────────────────────────────────────────
// 6. Toggle Product Availability
// ─────────────────────────────────────────────────────────────
export const toggleProductAvailabilityService = async (
  id: string,
  isAvailable: boolean
): Promise<IProduct> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid product ID", 400);
    }

    const product = await ProductTable.findByIdAndUpdate(
      id,
      { isAvailable },
      {
        new: true,
        select: "-__v",
      }
    );

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return product;
  } catch (error) {
    if (error instanceof AppError) throw error;

    console.error("Toggle availability error:", error);
    throw new AppError(
      "Failed to update product availability - internal server error",
      500
    );
  }
};

// & Product Details
export const getProductDetailService = async (
  productId: string
): Promise<Partial<IProduct>> => {
  try {
    // Step 1: Validate productId is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(productId)) {
      throw new AppError("Invalid product ID format", 400);
    }

    // Step 2: Query product with strict conditions
    const product = await ProductTable.findOne({
      _id: new Types.ObjectId(productId),
      isActive: true, // only active products
    })
      .populate("categoryId", "name description") // populate only needed category fields
      .lean() // faster & safer (plain JS object)
      .select(
        "name description basePrice categoryId image isAvailable preparationTime allergens isPopular displayOrder createdAt"
      ); // limited fields – no heavy arrays like variants/addons unless needed

    // Step 3: Not found or inactive
    if (!product) {
      throw new AppError("Product not found or is currently inactive", 404);
    }

    // Step 4: Success – return clean, limited data
    return product;
  } catch (error) {
    // Handle known AppError types (400, 404)
    if (error instanceof AppError) {
      throw error;
    }

    // Log unexpected errors (in production → use winston/sentry)
    console.error("[CRITICAL] Get product detail failed:", {
      productId,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Generic safe error for client
    throw new AppError(
      "Failed to fetch product details - please try again later",
      500
    );
  }
};