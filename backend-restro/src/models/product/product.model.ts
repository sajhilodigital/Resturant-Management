import { Schema, model } from "mongoose";

const productSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
});

export const Product = model("Product", productSchema);
