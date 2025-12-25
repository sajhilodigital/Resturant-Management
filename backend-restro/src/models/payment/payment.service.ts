import { Payment } from "./payment.model.js";
import QRCode from "qrcode";
import { ENV } from "../../config/env.js";

export const createPayment = async (
  billId: string,
  method: string,
  amount: number
) => {
  let qrCode;
  if (method === "qr") {
    const paymentLink = `${ENV.PAYMENT_GATEWAY_URL}?billId=${billId}&amount=${amount}`;
    qrCode = await QRCode.toDataURL(paymentLink);
  }

  return new Payment({ billId, method, qrCode }).save();
};

export const confirmPayment = async (id: string, transactionId: string) => {
  const payment = await Payment.findById(id);
  if (!payment) throw new Error("Payment not found");
  payment.status = "paid";
  payment.transactionId = transactionId;
  await payment.save();
};
