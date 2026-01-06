// src/modules/bills/services/bill.service.ts

import { OrderTable } from "modules/order/order.model";
import { generateBillSchema } from "./bill.validation";
import { AppError } from "utils/appError";
import { BillTable } from "./bill.model";

export const generateBillService = async (
  data: unknown,
  createdBy: string,
  branchId: string
) => {
  const validated = generateBillSchema.parse(data);

  const order = await OrderTable.findById(validated.orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (order.status !== "served")
    throw new AppError("Order must be served to generate bill", 400);

  const bill = new BillTable({
    orderId: order._id,
    subtotal: order.total,
    tax: validated.tax || 0,
    serviceCharge: validated.serviceCharge || 0,
    discount: validated.discount || 0,
    createdBy,
    branchId,
  });

  await bill.save();
  return bill;
};
