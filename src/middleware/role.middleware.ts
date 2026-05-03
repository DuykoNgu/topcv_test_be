import { Request, Response, NextFunction } from "express";
import { Role } from "../generated/prisma/client";
import { ResponseHandler } from "../utils/response";

/**
 * Middleware kiểm tra user có role được phép không
 * @param roles - Danh sách role được phép truy cập (vd: ['ADMIN'])
 */
export const authorize = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ResponseHandler.unauthorized(res, "Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      return ResponseHandler.forbidden(
        res,
        `Requires one of the following roles: ${roles.join(", ")}`
      );
    }

    next();
  };
};

/**
 * Middleware yêu cầu role ADMIN
 */
export const requireAdmin = authorize(["ADMIN"]);

/**
 * Middleware yêu cầu role STAFF
 */
export const requireStaff = authorize(["STAFF"]);

/**
 * Middleware yêu cầu role ADMIN hoặc STAFF
 */
export const requireAdminOrStaff = authorize(["ADMIN", "STAFF"]);
