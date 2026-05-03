import { Request, Response } from "express";
import { serviceFactory } from "../factories/service.factory";
import { ResponseHandler } from "../utils/response";

export class SubmissionController {
  private readonly submissionService = serviceFactory.createSubmissionService();

  /**
   * Lấy toàn bộ danh sách các bản ghi (submissions) kèm thông tin chi tiết.
   * Chỉ dành cho vai trò ADMIN.
   */
  async getAllSubmissions(req: Request, res: Response) {
    const submissions = await this.submissionService.getAllSubmissionsWithDetails();
    ResponseHandler.success(res, submissions, 200);
  }

  /**
   * Thực hiện nộp form khảo sát.
   * Yêu cầu người dùng phải đăng nhập (Staff hoặc Admin).
   */
  async submitForm(req: Request, res: Response) {
    const formId = String(req.params.formId);
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const values = req.body.values || [];
    const submission = await this.submissionService.submitForm(formId, userId, values);
    ResponseHandler.success(res, submission, 201);
  }

  /**
   * Lấy danh sách các bản ghi đã nộp của người dùng hiện tại theo form cụ thể.
   */
  async getMySubmissionsForForm(req: Request, res: Response) {
    const formId = String(req.params.formId);
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const submissions = await this.submissionService.getMySubmissionsForForm(formId, userId);
    ResponseHandler.success(res, submissions, 200);
  }

  /**
   * Cập nhật nội dung bản ghi đã nộp.
   * Cho phép người nộp sửa lại thông tin của mình.
   */
  async updateSubmission(req: Request, res: Response) {
    const submissionId = String(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const values = req.body.values || [];
    const updatedSubmission = await this.submissionService.updateSubmission(submissionId, userId, values);
    ResponseHandler.success(res, updatedSubmission, 200);
  }
}
