// src/modules/payments/services/payment.service.ts

import { BillTable } from "modules/bill/bill.model";
import { createPaymentSchema } from "./payment.validation";
import { AppError } from "utils/appError";
import { PaymentTable } from "./payment.model";

export const createPaymentService = async (
  data: unknown,
  createdBy: string
) => {
  const validated = createPaymentSchema.parse(data);

  const bill = await BillTable.findById(validated.billId);
  if (!bill) throw new AppError("Bill not found", 404);
  if (bill.status === "paid") throw new AppError("Bill already paid", 400);

  const payment = new PaymentTable({
    ...validated,
    createdBy,
  });

  await payment.save();

  if (payment.status === "success") {
    bill.status = "paid";
    await bill.save();
  }

  return payment;
};
