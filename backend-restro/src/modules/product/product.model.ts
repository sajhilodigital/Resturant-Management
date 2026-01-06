// src/modules/menu/products/models/product.model.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IProductVariant {
  name: string; 
  price: number;
  sku?: string;
  isDefault?: boolean;
}

export interface IProductAddon {
  name: string;
  price: number;
  maxQuantity?: number;
}

export interface IProduct extends Document {
  name: string;
  description?: string;
  basePrice: number;
  variants?: IProductVariant[];
  addons?: IProductAddon[];
  categoryId: Types.ObjectId;
  image?: string;
  isAvailable: boolean;
  preparationTime?: number; // minutes
  allergens?: string[];
  isPopular?: boolean;
  displayOrder: number;
  createdBy: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: { type: String, trim: true },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    variants: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        sku: String,
        isDefault: Boolean,
      },
    ],
    addons: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        maxQuantity: { type: Number, min: 1 },
      },
    ],
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    image: { type: String },
    isAvailable: { type: Boolean, default: true, index: true },
    preparationTime: { type: Number, min: 0 },
    allergens: [{ type: String }],
    isPopular: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ categoryId: 1, isAvailable: 1, isActive: 1 });

export const ProductTable = model<IProduct>("Product", productSchema);
