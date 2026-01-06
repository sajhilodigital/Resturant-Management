// src/modules/bills/models/bill.model.ts

import { model, Schema, Types } from "mongoose";

export interface IBill extends Document {
  orderId: Types.ObjectId;
  billNumber: string; // BILL-YYYYMMDD-XXXX
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  grandTotal: number;
  status: "open" | "paid" | "void";
  createdBy: Types.ObjectId;
  branchId: Types.ObjectId;
}

const billSchema = new Schema<IBill>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    billNumber: { type: String, unique: true, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    serviceCharge: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["open", "paid", "void"],
      default: "open",
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
  },
  { timestamps: true }
);

// Auto-generate bill number & grand total
billSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date();
    const prefix = `BILL-${date.getFullYear()}${String(
      date.getMonth() + 1
    ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    const count = await this.model("Bill").countDocuments({
      billNumber: { $regex: `^${prefix}` },
    });
    this.billNumber = `${prefix}-${String(count + 1).padStart(4, "0")}`;
  }

  this.grandTotal =
    this.subtotal + this.tax + this.serviceCharge - this.discount;
});

export const BillTable = model<IBill>("Bill", billSchema);
