import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ResponseHandler } from "../utils/response";

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return ResponseHandler.badRequest(
          res,
          "Validation failed",
          error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        );
      }
      return ResponseHandler.internalError(res, "Validation error", error);
    }
  };
};