// src/modules/tables/models/table.model.ts

import { model, Schema, Types } from "mongoose";

export interface ITable {
  tableNumber: string;
  capacity: number;
  status: "free" | "occupied" | "reserved" | "dirty" | "maintenance";
  location?: string;
  qrCode?: string;
  branchId: Types.ObjectId;
}

const tableSchema = new Schema<ITable>(
  {
    tableNumber: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["free", "occupied", "reserved", "dirty", "maintenance"],
      default: "free",
      index: true,
    },
    location: String,
    qrCode: { type: String, unique: true, sparse: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
  },
  { timestamps: true }
);

export const TableTable = model<ITable>("Table", tableSchema);
