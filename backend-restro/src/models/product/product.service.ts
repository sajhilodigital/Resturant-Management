import { Product } from "./product.model.js";

export const createProduct = async (data: any) => new Product(data).save();

export const getProducts = async () => Product.find().populate("categoryId");

export const updateProduct = async (id: string, data: any) =>
  Product.findByIdAndUpdate(id, data, { new: true });

export const deleteProduct = async (id: string) =>
  Product.findByIdAndDelete(id);

export const deductStock = async (id: string, quantity: number) => {
  const product = await Product.findById(id);
  if (!product || product.stock < quantity)
    throw new Error("Insufficient stock");
  product.stock -= quantity;
  await product.save();
};
