import { Schema, model } from "mongoose";

const paymentSchema = new Schema({
  billId: { type: Schema.Types.ObjectId, ref: "Bill", required: true },
  method: { type: String, enum: ["cash", "card", "qr"], required: true },
  status: { type: String, enum: ["pending", "paid"], default: "pending" },
  qrCode: String,
  transactionId: String,
});

export const Payment = model("Payment", paymentSchema);
