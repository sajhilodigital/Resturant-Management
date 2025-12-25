import { Category } from "./category.model.js";

export const createCategory = async (data: any) => new Category(data).save();

export const getCategories = async () => Category.find();

export const updateCategory = async (id: string, data: any) =>
  Category.findByIdAndUpdate(id, data, { new: true });

export const deleteCategory = async (id: string) =>
  Category.findByIdAndDelete(id);
