import { Bill } from "./bill.model.js";
import { Order } from "../order/order.model.js";
import PDFDocument from "pdfkit";
import fs from "fs";

export const generateBill = async (
  orderId: string,
  taxes: number,
  discounts: number
) => {
  const order = await Order.findById(orderId).populate("items.productId");
  if (!order || order.status !== "completed")
    throw new Error("Order not ready");

  const bill = new Bill({
    orderId,
    totalAmount: order.totalPrice,
    taxes,
    discounts,
  });
  await bill.save();

  // Print PDF receipt (reusable)
  const doc = new PDFDocument();
  const filePath = `./receipts/bill_${bill._id}.pdf`;
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(25).text("Bill Receipt", { align: "center" });
  doc.text(`Order ID: ${orderId}`);
  doc.text(`Total: $${bill.finalAmount}`);
  // Add items, etc.

  doc.end();

  return { bill, pdfPath: filePath };
};
