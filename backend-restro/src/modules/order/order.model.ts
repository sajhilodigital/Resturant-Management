// src/modules/orders/models/order.model.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string; // snapshot at order time
  quantity: number;
  price: number; // snapshot price per unit
  notes?: string;
  addons?: string[];
  variant?: string; // e.g. "Large"
}

export interface IOrder extends Document {
  tableId?: Types.ObjectId; // optional (takeaway/delivery)
  customerName?: string;
  customerPhone?: string;
  items: IOrderItem[];
  status:
    | "pending"
    | "preparing"
    | "ready"
    | "served"
    | "cancelled"
    | "void"
    | "completed";
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  grandTotal: number;
  createdBy: Types.ObjectId; // waiter/cashier
  servedBy: Types.ObjectId;
  branchId: Types.ObjectId;
  orderNumber: string; // auto: ORD-YYYYMMDD-XXXX
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    tableId: { type: Schema.Types.ObjectId, ref: "Table" },
    customerName: { type: String, trim: true },
    customerPhone: { type: String, trim: true },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        notes: String,
        addons: [String],
        variant: String,
      },
    ],
    status: {
      type: String,
      enum: [
        "pending",
        "preparing",
        "ready",
        "served",
        "cancelled",
        "void",
        "completed",
      ],
      default: "pending",
      index: true,
    },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    serviceCharge: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    servedBy: { type: Schema.Types.ObjectId, ref: "User" },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    orderNumber: { type: String, unique: true, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate order number (e.g. ORD-20250101-0001)
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date();
    const prefix = `ORD-${date.getFullYear()}${String(
      date.getMonth() + 1
    ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    const count = await this.model("Order").countDocuments({
      orderNumber: { $regex: `^${prefix}` },
    });
    this.orderNumber = `${prefix}-${String(count + 1).padStart(4, "0")}`;
  }

  // Auto-calculate grand total
  this.grandTotal =
    this.subtotal +
    (this.tax || 0) +
    (this.serviceCharge || 0) -
    (this.discount || 0);
});

// Indexes for performance
orderSchema.index({ branchId: 1, status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

export const OrderTable = model<IOrder>("Order", orderSchema);
