import { Request, Response } from "express";
import { serviceFactory } from "../factories/service.factory";
import { ResponseHandler } from "../utils/response";

export class FieldController {
  private readonly fieldService = serviceFactory.createFieldService();

  /**
   * POST /api/forms/:formId/fields
   */
  async createField(req: Request, res: Response) {
    try {
      const formId = String(req.params.formId);
      const fieldData = req.body;

      if (fieldData.formId && fieldData.formId !== formId) {
        return ResponseHandler.badRequest(res, "Form ID mismatch");
      }
      fieldData.formId = formId;
      fieldData.createdBy = req.user?.id;
      fieldData.updatedBy = req.user?.id;

      const field = await this.fieldService.createField(fieldData);
      ResponseHandler.success(res, field, 201);
    } catch (error: any) {
      if (error.code === "P2002") {
        ResponseHandler.conflict(res, "Duplicate entry", error.meta?.target);
        return;
      }
      ResponseHandler.internalError(res, "Failed to create field", error.message);
    }
  }

  /**
   * PUT /api/forms/:formId/fields/:fieldId
   */
  async updateField(req: Request, res: Response) {
    try {
      const formId = String(req.params.formId);
      const fieldId = String(req.params.fieldId);
      const fieldData = req.body;

      const existingField = await this.fieldService.getFieldById(fieldId);
      if (!existingField) {
        return ResponseHandler.notFound(res, "Field not found");
      }
      if (existingField.formId !== formId) {
        return ResponseHandler.badRequest(res, "Field does not belong to this form");
      }

      fieldData.updatedBy = req.user?.id;

      const field = await this.fieldService.updateField(fieldId, fieldData);
      ResponseHandler.success(res, field, 200);
    } catch (error: any) {
      if (error.code === "P2002") {
        ResponseHandler.conflict(res, "Duplicate entry", error.meta?.target);
        return;
      }
      ResponseHandler.internalError(res, "Failed to update field", error.message);
    }
  }

  /**
   * DELETE /api/forms/:formId/fields/:fieldId
   */
  async deleteField(req: Request, res: Response) {
    try {
      const formId = String(req.params.formId);
      const fieldId = String(req.params.fieldId);

      const existingField = await this.fieldService.getFieldById(fieldId);
      if (!existingField) {
        return ResponseHandler.notFound(res, "Field not found");
      }
      if (existingField.formId !== formId) {
        return ResponseHandler.badRequest(res, "Field does not belong to this form");
      }

      await this.fieldService.deleteField(fieldId, req.user?.id);
      ResponseHandler.success(res, { message: "Field deleted successfully" }, 200);
    } catch (error: any) {
      ResponseHandler.internalError(res, "Failed to delete field", error.message);
    }
  }
}
