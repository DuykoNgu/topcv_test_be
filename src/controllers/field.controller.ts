import { Request, Response } from "express";
import { serviceFactory } from "../factories/service.factory";
import { ResponseHandler } from "../utils/response";

export class FieldController {
  private readonly fieldService = serviceFactory.createFieldService();

  /**
   * Tạo một trường thông tin mới cho một form.
   */
  async createField(req: Request, res: Response) {
    const field = await this.fieldService.createField(
      String(req.params.formId),
      req.body,
      req.user?.id
    );

    ResponseHandler.success(res, field, 201);
  }

  /**
   * Cập nhật thông tin của một trường trong form.
   */
  async updateField(req: Request, res: Response) {
    const field = await this.fieldService.updateField(
      String(req.params.formId),
      String(req.params.fieldId),
      req.body,
      req.user?.id
    );

    ResponseHandler.success(res, field, 200);
  }

  /**
   * Xóa một trường khỏi form (xóa mềm).
   */
  async deleteField(req: Request, res: Response) {
    await this.fieldService.deleteField(
      String(req.params.formId),
      String(req.params.fieldId),
      req.user?.id
    );

    ResponseHandler.success(res, {
      message: "Field deleted successfully",
    }, 200);
  }
}
