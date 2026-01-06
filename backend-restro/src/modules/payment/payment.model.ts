// src/modules/payments/models/payment.model.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IPayment extends Document {
  billId: Types.ObjectId;
  amount: number;
  currency: string;
  method:
    | "cash"
    | "card"
    | "esewa"
    | "khalti"
    | "imepay"
    | "fonepay"
    | "bank_transfer"
    | "cheque"
    | "qr_code";
  status: "pending" | "success" | "failed" | "refunded" | "partial";
  transactionId?: string;
  bankRef?: string;
  vatAmount?: number;
  notes?: string;
  createdBy: Types.ObjectId;
  isActive: boolean;
  deletedAt?: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    billId: {
      type: Schema.Types.ObjectId,
      ref: "Bill",
      required: [true, "Bill ID is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "NPR",
      enum: ["NPR", "USD", "INR"],
      required: true,
    },
    method: {
      type: String,
      enum: [
        "cash",
        "card",
        "esewa",
        "khalti",
        "imepay",
        "fonepay",
        "bank_transfer",
        "cheque",
        "qr_code",
      ],
      required: [true, "Payment method is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded", "partial"],
      default: "pending",
      index: true,
    },
    transactionId: {
      type: String,
      sparse: true,
      index: true,
    },
    bankRef: {
      type: String,
      sparse: true,
    },
    vatAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance (very important for Nepal restaurants with high volume)
paymentSchema.index({ billId: 1, status: 1 });
paymentSchema.index({ method: 1, createdAt: -1 });
paymentSchema.index({ createdBy: 1, branchId: 1 });

// Soft delete middleware (optional - if you want to use deletedAt instead of isActive)
paymentSchema.pre("find", function () {
  this.where({ isActive: true });
});

export const PaymentTable = model<IPayment>("Payment", paymentSchema);
