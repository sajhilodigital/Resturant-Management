
import { Types } from "mongoose";
import { CategoryTable, ICategory } from "./category.model";
import { AppError } from "utils/appError";
import { createCategorySchema, toggleCategoryStatusSchema, updateCategorySchema } from "./category.validation";

export const createCategory = async (
  data: unknown,
  createdBy: string
): Promise<ICategory> => {
  const validated = createCategorySchema.parse(data);

  // Check for duplicate name (case insensitive)
  const exists = await CategoryTable.exists({
    name: { $regex: `^${validated.name}$`, $options: "i" },
  });

  if (exists) throw new AppError("Category name already exists", 409);

  const category = await CategoryTable.create({
    ...validated,
    createdBy: new Types.ObjectId(createdBy),
  });

  return category;
};

export const getAllCategories = async (
  activeOnly = true
): Promise<ICategory[]> => {
  const query = activeOnly ? { isActive: true } : {};
  return CategoryTable.find(query)
    .sort({ displayOrder: 1, name: 1 })
    .lean()
    .select("-__v");
};

export const getCategoryById = async (id: string): Promise<ICategory> => {
  const category = await CategoryTable.findById(id).lean().select("-__v");

  if (!category) throw new AppError("Category not found", 404);

  return category;
};

export const updateCategory = async (
  id: string,
  data: unknown
): Promise<ICategory> => {
  const validated = updateCategorySchema.parse(data);

  const category = await CategoryTable.findByIdAndUpdate(id, validated, {
    new: true,
    runValidators: true,
    select: "-__v",
  });

  if (!category) throw new AppError("Category not found", 404);

  return category;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const category = await CategoryTable.findById(id);
  if (!category) throw new AppError("Category not found", 404);

  // Optional: prevent deletion if products are using it
  // const hasProducts = await Product.exists({ categoryId: id });
  // if (hasProducts) throw new AppError('Cannot delete category with products', 409);

  await category.deleteOne();
};

export const toggleCategoryStatusService = async (
  categoryId: string,
  data: unknown
): Promise<any> => {
  // 1. Validate MongoDB ID
  if (!Types.ObjectId.isValid(categoryId)) {
    throw new AppError("Invalid category ID", 400);
  }

  // 2. Validate input body
  const validated = toggleCategoryStatusSchema.parse(data);

  // 3. Find and update (atomic)
  const category = await CategoryTable.findByIdAndUpdate(
    categoryId,
    { isActive: validated.isActive },
    {
      new: true, // return updated document
      runValidators: true,
      select: "-__v", // exclude version key
    }
  );

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return {
    success: true,
    message: `Category is now ${validated.isActive ? "active" : "inactive"}`,
    data: category,
  };
};