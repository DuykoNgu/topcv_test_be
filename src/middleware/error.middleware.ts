import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../utils/response";

/**
 * Middleware xử lý bất đồng bộ để tránh phải viết try-catch lặp đi lặp lại.
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Middleware xử lý lỗi tập trung cho toàn bộ ứng dụng.
 */
export const globalErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  // Lỗi Prisma: Bản ghi không tồn tại
  if (error.code === "P2025") {
    return ResponseHandler.notFound(res, error.message || "Không tìm thấy bản ghi");
  }

  // Lỗi Prisma: Ràng buộc duy nhất (Unique constraint)
  if (error.code === "P2002") {
    return ResponseHandler.conflict(res, "Dữ liệu đã tồn tại", error.meta?.target);
  }

  // Lỗi cụ thể từ Business Logic
  if (
    error.message === "Form not found" || 
    error.message === "Field not found" || 
    error.message === "Submission not found" ||
    error.message === "User not found"
  ) {
    return ResponseHandler.notFound(res, error.message);
  }

  if (
    error.message === "Form is not active" || 
    error.message === "One or more fields are invalid" ||
    error.message === "Form ID mismatch" ||
    error.message === "Field does not belong to this form"
  ) {
    return ResponseHandler.badRequest(res, error.message);
  }

  if (
    error.message === "You do not have permission to edit this submission" ||
    error.message === "You don't have permission to edit this submission"
  ) {
    return ResponseHandler.forbidden(res, error.message);
  }

  if (error.message === "User not authenticated") {
    return ResponseHandler.unauthorized(res, error.message);
  }

  // Lỗi có statusCode xác định
  if (error.statusCode) {
    return ResponseHandler.error(res, "ERROR", error.message, error.statusCode);
  }

  // Các lỗi không xác định khác trả về 500
  console.error("[Error Handler]:", error);
  return ResponseHandler.internalError(res, "Đã xảy ra lỗi hệ thống", error.message);
};
