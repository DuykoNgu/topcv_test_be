import { Request, Response } from "express";
import { serviceFactory } from "../factories/service.factory";
import { ResponseHandler } from "../utils/response";

export class FormController {
  private readonly formService = serviceFactory.createFormService();

  /**
   * GET /api/forms?page=&limit=
   */
  async getAllForms(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const { data, total } = await this.formService.getPaginatedForms(skip, limit);
      const totalPages = Math.ceil(total / limit);

      ResponseHandler.success(res, data, 200, {
        page,
        limit,
        total,
        totalPages,
      });
    } catch (error: any) {
      ResponseHandler.internalError(res, "Failed to fetch forms", error.message);
    }
  }

  /**
   * GET /api/forms/active
   */
  async getActiveForms(req: Request, res: Response) {
    try {
      const forms = await this.formService.getActiveForms();
      ResponseHandler.success(res, forms, 200);
    } catch (error: any) {
      ResponseHandler.internalError(res, "Failed to fetch active forms", error.message);
    }
  }

  /**
   * GET /api/forms/:id
   */
  async getFormById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const form = await this.formService.getFormById(id);
      if (!form) {
        return ResponseHandler.notFound(res, "Form not found");
      }
      ResponseHandler.success(res, form, 200);
    } catch (error: any) {
      ResponseHandler.internalError(res, "Failed to fetch form", error.message);
    }
  }

  /**
   * POST /api/forms
   */
  async createForm(req: Request, res: Response) {
    try {
      const form = await this.formService.createForm(req.body, req.user?.id);
      ResponseHandler.success(res, form, 201);
    } catch (error: any) {
      if (error.code === "P2002") {
        ResponseHandler.conflict(res, "Duplicate entry", error.meta?.target);
        return;
      }
      ResponseHandler.internalError(res, "Failed to create form", error.message);
    }
  }

  /**
   * PUT /api/forms/:id
   */
  async updateForm(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const form = await this.formService.updateForm(id, req.body, req.user?.id);
      if (!form) {
        return ResponseHandler.notFound(res, "Form not found");
      }
      ResponseHandler.success(res, form, 200);
    } catch (error: any) {
      if (error.code === "P2025") {
        return ResponseHandler.notFound(res, "Form not found");
      }
      if (error.code === "P2002") {
        return ResponseHandler.conflict(res, "Duplicate entry", error.meta?.target);
      }
      ResponseHandler.internalError(res, "Failed to update form", error.message);
    }
  }

  /**
   * DELETE /api/forms/:id
   */
  async deleteForm(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const form = await this.formService.deleteForm(id, req.user?.id);
      if (!form) {
        return ResponseHandler.notFound(res, "Form not found");
      }
      ResponseHandler.success(res, { message: "Form deleted successfully" }, 200);
    } catch (error: any) {
      if (error.code === "P2025") {
        return ResponseHandler.notFound(res, "Form not found");
      }
      ResponseHandler.internalError(res, "Failed to delete form", error.message);
    }
  }
}
