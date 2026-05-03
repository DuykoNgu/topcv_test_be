import { Request, Response } from "express";
import { serviceFactory } from "../factories/service.factory";
import { ResponseHandler } from "../utils/response";

export class FieldController {
  private readonly fieldService = serviceFactory.createFieldService();

  /**
   * Tạo một trường thông tin mới cho một form.
   */
  async createField(req: Request, res: Response) {
    try {
      const formId = String(req.params.formId);
      const fieldData = req.body;
      const userId = req.user?.id;

      const field = await this.fieldService.createField(formId, fieldData, userId);
      ResponseHandler.success(res, field, 201);
    } catch (error: any) {
      if (error.message === "Form ID mismatch") {
        return ResponseHandler.badRequest(res, error.message);
      }
      if (error.code === "P2002") {
        ResponseHandler.conflict(res, "Duplicate entry", error.meta?.target);
        return;
      }
      ResponseHandler.internalError(res, "Failed to create field", error.message);
    }
  }

  /**
   * Cập nhật thông tin của một trường trong form.
   */
  async updateField(req: Request, res: Response) {
    try {
      const formId = String(req.params.formId);
      const fieldId = String(req.params.fieldId);
      const fieldData = req.body;
      const userId = req.user?.id;

      const field = await this.fieldService.updateField(formId, fieldId, fieldData, userId);
      ResponseHandler.success(res, field, 200);
    } catch (error: any) {
      if (error.message === "Field not found") {
        return ResponseHandler.notFound(res, error.message);
      }
      if (error.message === "Field does not belong to this form") {
        return ResponseHandler.badRequest(res, error.message);
      }
      if (error.code === "P2002") {
        ResponseHandler.conflict(res, "Duplicate entry", error.meta?.target);
        return;
      }
      ResponseHandler.internalError(res, "Failed to update field", error.message);
    }
  }

  /**
   * Xóa một trường khỏi form (xóa mềm).
   */
  async deleteField(req: Request, res: Response) {
    try {
      const formId = String(req.params.formId);
      const fieldId = String(req.params.fieldId);
      const userId = req.user?.id;

      await this.fieldService.deleteField(formId, fieldId, userId);
      ResponseHandler.success(res, { message: "Field deleted successfully" }, 200);
    } catch (error: any) {
      if (error.message === "Field not found") {
        return ResponseHandler.notFound(res, error.message);
      }
      if (error.message === "Field does not belong to this form") {
        return ResponseHandler.badRequest(res, error.message);
      }
      ResponseHandler.internalError(res, "Failed to delete field", error.message);
    }
  }
}
