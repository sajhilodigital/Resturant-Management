// src/modules/orders/interfaces/order.interface.ts
import { Document, Types } from "mongoose";

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  addons?: string[];
  variant?: string;
}

export interface IOrder extends Document {
  tableId?: Types.ObjectId;
  customerName?: string;
  customerPhone?: string;
  items: IOrderItem[];
  status: "pending" | "preparing" | "ready" | "served" | "cancelled";
  total: number;
  discount?: number;
  tax?: number;
  serviceCharge?: number;
  grandTotal: number;
  createdBy: Types.ObjectId;
  branchId: Types.ObjectId;
  orderNumber: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  tableId?: string;
  customerName?: string;
  customerPhone?: string;
  items: {
    productId: string;
    quantity: number;
    notes?: string;
    addons?: string[];
    variant?: string;
  }[];
}

export interface UpdateOrderStatusInput {
  status: "pending" | "preparing" | "ready" | "served" | "cancelled";
}
