import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repository/user.repository";
import type { User } from "../generated/prisma/client";

const userRepository = new UserRepository();

export class AuthMiddleware {
  async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "No token provided",
          code: "MISSING_TOKEN",
        });
        return;
      }

      const token = authHeader.substring(7);

      if (!token) {
        res.status(401).json({
          success: false,
          message: "Invalid token format",
          code: "INVALID_TOKEN_FORMAT",
        });
        return;
      }

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
        res.status(401).json({
          success: false,
          message: "User not found",
          code: "USER_NOT_FOUND",
        });
        return;
      }

      req.user = user as User;
      next();
    } catch (err: any) {
      if (err.name === "JsonWebTokenError") {
        res.status(401).json({
          success: false,
          message: "Invalid token",
          code: "INVALID_TOKEN",
        });
        return;
      }
      if (err.name === "TokenExpiredError") {
        res.status(401).json({
          success: false,
          message: "Token expired",
          code: "TOKEN_EXPIRED",
        });
        return;
      }

      console.error("Auth middleware error:", err);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }

  async optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
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
      }

      next();
    } catch {
      next();
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const auth = new AuthMiddleware();
  auth.authenticate(req, res, next);
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = new AuthMiddleware();
  auth.optionalAuth(req, res, next);
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err.stack);
  
  // Handle Prisma errors
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Resource not found",
      },
    });
  }

  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      error: {
        code: "CONFLICT",
        message: "Duplicate entry",
        details: { field: err.meta?.target },
      },
    });
  }

  // Handle custom AppError
  if (err.name === "AppError") {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: err.message,
        details: err.details,
      },
    });
  }

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong!",
    },
  });
};