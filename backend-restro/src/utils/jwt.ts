import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET!;

export const generateToken = (payload: object, expiresIn = "1d") =>
  jwt.sign(payload, JWT_SECRET, { expiresIn });

export const verifyToken = (token: string) =>
  jwt.verify(token, JWT_SECRET) as {
    id: string;
    role: string;
    permissions: string[];
  };
