import { Request, Response } from "express";
import { serviceFactory } from "../factories/service.factory";
import { ResponseHandler } from "../utils/response";

export class FormController {
  private readonly formService = serviceFactory.createFormService();

  /**
   * Lấy danh sách tất cả các form có phân trang.
   */
  async getAllForms(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, total, totalPages } = await this.formService.getPaginatedForms(page, limit);

    ResponseHandler.success(res, data, 200, {
      page,
      limit,
      total,
      totalPages,
    });
  }

  /**
   * Lấy danh sách các form đang ở trạng thái ACTIVE (dành cho nhân viên).
   */
  async getActiveForms(req: Request, res: Response) {
    const forms = await this.formService.getActiveForms();
    ResponseHandler.success(res, forms, 200);
  }

  /**
   * Lấy thông tin chi tiết của một form cụ thể theo ID.
   */
  async getFormById(req: Request, res: Response) {
    const id = String(req.params.id);
    const form = await this.formService.getFormById(id);
    if (!form) {
      throw new Error("Form not found");
    }
    ResponseHandler.success(res, form, 200);
  }

  /**
   * Tạo một mẫu form mới.
   */
  async createForm(req: Request, res: Response) {
    const form = await this.formService.createForm(req.body, req.user?.id);
    ResponseHandler.success(res, form, 201);
  }

  /**
   * Cập nhật thông tin của một mẫu form hiện có.
   */
  async updateForm(req: Request, res: Response) {
    const id = String(req.params.id);
    const form = await this.formService.updateForm(id, req.body, req.user?.id);
    if (!form) {
      throw new Error("Form not found");
    }
    ResponseHandler.success(res, form, 200);
  }

  /**
   * Xóa một mẫu form (xóa mềm).
   */
  async deleteForm(req: Request, res: Response) {
    const id = String(req.params.id);
    const form = await this.formService.deleteForm(id, req.user?.id);
    if (!form) {
      throw new Error("Form not found");
    }
    ResponseHandler.success(res, { message: "Form deleted successfully" }, 200);
  }
}
