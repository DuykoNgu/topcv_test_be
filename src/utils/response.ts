import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ResponseHandler {
  static success<T>(res: Response, data: T, statusCode: number = 200, pagination?: any) {
    const response: ApiResponse<T> = {
      success: true,
      data,
    };
    if (pagination) {
      response.pagination = pagination;
    }
    res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    code: string,
    message: string,
    statusCode: number = 500,
    details?: any,
  ) {
    res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    });
  }

  static notFound(res: Response, message: string = "Resource not found") {
    this.error(res, "NOT_FOUND", message, 404);
  }

  static badRequest(res: Response, message: string = "Bad request", details?: any) {
    this.error(res, "BAD_REQUEST", message, 400, details);
  }

  static unauthorized(res: Response, message: string = "Unauthorized") {
    this.error(res, "UNAUTHORIZED", message, 401);
  }

  static forbidden(res: Response, message: string = "Forbidden") {
    this.error(res, "FORBIDDEN", message, 403);
  }

  static conflict(res: Response, message: string = "Conflict", details?: any) {
    this.error(res, "CONFLICT", message, 409, details);
  }

  static internalError(res: Response, message: string = "Internal server error", details?: any) {
    this.error(res, "INTERNAL_SERVER_ERROR", message, 500, details);
  }
}

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any,
  ) {
    super(message);
    this.name = "AppError";
  }
}
