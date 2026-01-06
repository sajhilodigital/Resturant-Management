// src/modules/bills/interfaces/bill.interface.ts
import { Document, Types } from "mongoose";

export interface IBill extends Document {
  orderId: Types.ObjectId;
  billNumber: string;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  grandTotal: number;
  status: "open" | "paid" | "void";
  createdBy: Types.ObjectId;
  branchId: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerateBillInput {
  orderId: string;
  tax?: number;
  serviceCharge?: number;
  discount?: number;
}
