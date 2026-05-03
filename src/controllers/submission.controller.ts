import { Request, Response } from "express";
import { serviceFactory } from "../factories/service.factory";
import { ResponseHandler } from "../utils/response";

export class SubmissionController {
  private readonly submissionService = serviceFactory.createSubmissionService();

  /**
   * GET /api/submissions
   */
  async getAllSubmissions(req: Request, res: Response) {
    try {
      const submissions = await this.submissionService.getAllSubmissionsWithDetails();
      ResponseHandler.success(res, submissions, 200);
    } catch (error: any) {
      ResponseHandler.internalError(res, "Failed to fetch submissions", error.message);
    }
  }

  /**
   * POST /api/forms/:formId/submit
   */
  async submitForm(req: Request, res: Response) {
    try {
      const formId = String(req.params.formId);
      const userId = req.user?.id;

      if (!userId) {
        return ResponseHandler.unauthorized(res, "User not authenticated");
      }

      const values = req.body.values || [];

      const submission = await this.submissionService.submitForm(formId, userId, values);
      ResponseHandler.success(res, submission, 201);
    } catch (error: any) {
      if (error.message === "Form not found") {
        return ResponseHandler.notFound(res, error.message);
      }
      if (error.message === "Form is not active") {
        return ResponseHandler.badRequest(res, error.message);
      }
      if (error.message === "One or more fields are invalid") {
        return ResponseHandler.badRequest(res, error.message);
      }
      ResponseHandler.badRequest(res, error.message || "Failed to submit form", error.details);
    }
  }

  /**
   * GET /api/forms/:formId/submissions/me
   */
  async getMySubmissionsForForm(req: Request, res: Response) {
    try {
      const formId = String(req.params.formId);
      const userId = req.user?.id;

      if (!userId) {
        return ResponseHandler.unauthorized(res, "User not authenticated");
      }

      const submissions = await this.submissionService.getMySubmissionsForForm(formId, userId);
      ResponseHandler.success(res, submissions, 200);
    } catch (error: any) {
      ResponseHandler.internalError(res, "Failed to fetch your submissions", error.message);
    }
  }
}
