import { Schema, model } from "mongoose";

const billSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  totalAmount: Number,
  taxes: Number,
  discounts: Number,
  finalAmount: Number,
  timestamp: { type: Date, default: Date.now },
});

billSchema.pre("save", function () {
  this.finalAmount = this.totalAmount + this.taxes - this.discounts;
});

export const Bill = model("Bill", billSchema);
