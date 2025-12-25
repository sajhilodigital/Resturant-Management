import { Schema, model } from "mongoose";

const orderSchema = new Schema({
  tableId: { type: Schema.Types.ObjectId, ref: "Table", required: true },
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
    },
  ],
  status: {
    type: String,
    enum: ["pending", "preparing", "ready", "completed"],
    default: "pending",
  },
  totalPrice: Number,
});

orderSchema.pre("save", function () {
  this.totalPrice = this.items.reduce(
    (sum, item) => sum + item.quantity * (item as any).price,
    0
  ); // Assume price populated
});

export const Order = model("Order", orderSchema);
