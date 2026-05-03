import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repository/user.repository";
import type { User } from "../generated/prisma/client";
import { asyncHandler } from "./error.middleware";
import { ResponseHandler } from "../utils/response";

const userRepository = new UserRepository();

export const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ResponseHandler.unauthorized(res, "No token provided");
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { id: string };
    const user = await userRepository.findById(decoded.id, {
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return ResponseHandler.unauthorized(res, "User not found");
    }

    req.user = user as User;
    next();
  } catch (err: any) {
    if (err.name === "JsonWebTokenError") {
      return ResponseHandler.unauthorized(res, "Invalid token");
    }
    if (err.name === "TokenExpiredError") {
      return ResponseHandler.unauthorized(res, "Token expired");
    }
    throw err;
  }
});

export const optionalAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { id: string };
      const user = await userRepository.findById(decoded.id, {
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
        },
      });

      if (user) {
        req.user = user as User;
      }
    } catch (err) {
      // Bỏ qua lỗi nếu là optional auth
    }
  }

  next();
});

// Các wrapper cũ đã thay thế bằng asyncHandler trực tiếp ở trên
