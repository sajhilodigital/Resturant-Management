// src/middlewares/auth.middleware.ts

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions?: string[];
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Get token from cookie (standard name 'jwt')
    const token = req.cookies?.jwt || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - no token found in cookies",
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      permissions?: string[];
    };

    // 3. Attach to request
    req.user = decoded;

    next();
  } catch (error: any) {
    console.error("JWT verification failed:", error.message);

    return res.status(401).json({
      success: false,
      message: error.message || "Unauthorized - invalid or expired token",
    });
  }
};
