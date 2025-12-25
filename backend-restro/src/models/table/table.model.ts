import { Schema, model } from "mongoose";

const tableSchema = new Schema({
  number: { type: String, required: true },
  status: {
    type: String,
    enum: ["free", "occupied", "reserved"],
    default: "free",
  },
  capacity: { type: Number, required: true },
});

export const Table = model("Table", tableSchema);
