// src/modules/tables/interfaces/table.interface.ts
import { Types } from "mongoose";

export interface ITable {
  number: string;
  capacity: number;
  status: "free" | "occupied" | "reserved" | "dirty" | "maintenance";
  location?: string;
  qrCode?: string;
  branchId: Types.ObjectId;
  createdBy: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTableInput {
  number: string;
  capacity: number;
  location?: string;
}

export interface UpdateTableInput extends Partial<CreateTableInput> {
  status?: "free" | "occupied" | "reserved" | "dirty" | "maintenance";
}
